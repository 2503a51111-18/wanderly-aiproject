
from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import (
    Destination,
    Attraction,
    Hotel,
    Booking,
    Payment,
    Trip,
    ItineraryItem,
)
from .services import build_plan


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wanderly Smart Tourism API",
    description="Destination discovery, trip planning, bookings and analytics",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Wanderly API is running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "online", "service": "Wanderly"}


# --------------------------------------------------
# DESTINATIONS
# --------------------------------------------------

@app.get("/api/destinations")
def get_destinations(db: Session = Depends(get_db)):
    destinations = db.scalars(select(Destination)).all()
    return destinations


@app.get("/api/destinations/{destination_id}")
def get_destination(
    destination_id: int,
    db: Session = Depends(get_db),
):
    destination = db.get(Destination, destination_id)

    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")

    return destination


@app.get("/api/destinations/{destination_id}/attractions")
def get_attractions(
    destination_id: int,
    db: Session = Depends(get_db),
):
    destination = db.get(Destination, destination_id)

    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")

    return db.scalars(
        select(Attraction).where(
            func.lower(Attraction.destination)
            == destination.name.lower()
        )
    ).all()


# --------------------------------------------------
# HOTELS
# --------------------------------------------------

@app.get("/api/hotels")
def get_hotels(db: Session = Depends(get_db)):
    return db.scalars(select(Hotel)).all()


@app.get("/api/hotels/{hotel_id}")
def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
):
    hotel = db.get(Hotel, hotel_id)

    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")

    return hotel


# --------------------------------------------------
# TRIP PLANNER
# --------------------------------------------------

@app.post("/api/planner")
def create_trip_plan(
    payload: dict,
    db: Session = Depends(get_db),
):
    destination = str(payload.get("destination", "")).strip()
    interest = str(payload.get("interest", "History")).strip() or "History"

    try:
        days = int(payload.get("days", 1))
        budget = float(payload.get("budget", 0))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422,
            detail="Days and budget must be valid numbers",
        )

    if not destination:
        raise HTTPException(
            status_code=422,
            detail="Please provide a destination",
        )

    if days < 1 or days > 30:
        raise HTTPException(
            status_code=422,
            detail="Trip duration must be between 1 and 30 days",
        )

    if budget <= 0:
        raise HTTPException(
            status_code=422,
            detail="Budget must be greater than zero",
        )

    # Generate the itinerary using the existing planner service.
    plan = build_plan(
        db=db,
        destination=destination,
        days=days,
        budget=budget,
        interest=interest,
    )

    items = plan.get("itinerary", [])

    # Never report a trip as saved when no itinerary was generated.
    if not items:
        return {
            **plan,
            "trip_id": None,
            "saved": False,
            "message": plan.get(
                "message",
                "No itinerary was generated for this destination.",
            ),
        }

    trip = Trip(
        destination=plan.get("destination", destination),
        days=days,
        budget=budget,
        interest=interest,
    )

    try:
        db.add(trip)
        db.flush()

        for item in items:
            db.add(
                ItineraryItem(
                    trip_id=trip.id,
                    day=int(item.get("day", 1)),
                    activity=str(
                        item.get("activity", "Explore local attractions")
                    ),
                    category=str(item.get("category", interest)),
                    estimated_cost=float(
                        item.get("estimated_cost", 0) or 0
                    ),
                    reason=str(item.get("reason", "")),
                )
            )

        db.commit()
        db.refresh(trip)

        return {
            **plan,
            "trip_id": trip.id,
            "created_at": (
                trip.created_at.isoformat()
                if trip.created_at
                else None
            ),
            "saved": True,
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="The itinerary could not be saved. Check the backend logs.",
        )


# --------------------------------------------------
# SAVED TRIPS — USED BY MY TRIPS
# --------------------------------------------------

@app.get("/api/trips")
def get_saved_trips(db: Session = Depends(get_db)):
    saved_trips = db.scalars(
        select(Trip).order_by(Trip.created_at.desc(), Trip.id.desc())
    ).all()

    results = []

    for trip in saved_trips:
        items = db.scalars(
            select(ItineraryItem)
            .where(ItineraryItem.trip_id == trip.id)
            .order_by(ItineraryItem.day, ItineraryItem.id)
        ).all()

        results.append(
            {
                "id": trip.id,
                "trip_id": trip.id,
                "destination": trip.destination,
                "days": trip.days,
                "budget": trip.budget,
                "interest": trip.interest,
                "created_at": (
                    trip.created_at.isoformat()
                    if trip.created_at
                    else None
                ),
                "itinerary": [
                    {
                        "id": item.id,
                        "day": item.day,
                        "activity": item.activity,
                        "category": item.category,
                        "estimated_cost": item.estimated_cost,
                        "reason": item.reason,
                    }
                    for item in items
                ],
            }
        )

    return results


@app.get("/api/trips/{trip_id}")
def get_saved_trip(
    trip_id: int,
    db: Session = Depends(get_db),
):
    trip = db.get(Trip, trip_id)

    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    items = db.scalars(
        select(ItineraryItem)
        .where(ItineraryItem.trip_id == trip.id)
        .order_by(ItineraryItem.day, ItineraryItem.id)
    ).all()

    return {
        "id": trip.id,
        "trip_id": trip.id,
        "destination": trip.destination,
        "days": trip.days,
        "budget": trip.budget,
        "interest": trip.interest,
        "created_at": (
            trip.created_at.isoformat()
            if trip.created_at
            else None
        ),
        "itinerary": [
            {
                "id": item.id,
                "day": item.day,
                "activity": item.activity,
                "category": item.category,
                "estimated_cost": item.estimated_cost,
                "reason": item.reason,
            }
            for item in items
        ],
    }


# --------------------------------------------------
# HOTEL BOOKINGS
# --------------------------------------------------

@app.get("/api/bookings")
def get_bookings(db: Session = Depends(get_db)):
    return db.scalars(
        select(Booking).order_by(Booking.id.desc())
    ).all()


@app.post("/api/bookings")
def create_booking(
    payload: dict,
    db: Session = Depends(get_db),
):
    customer_name = str(payload.get("customer_name", "")).strip()

    try:
        hotel_id = int(payload.get("hotel_id", 0))
        nights = int(payload.get("nights", 1))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=422,
            detail="Hotel ID and nights must be valid numbers",
        )

    if len(customer_name) < 2:
        raise HTTPException(
            status_code=422,
            detail="Enter a valid customer name",
        )

    if nights < 1 or nights > 30:
        raise HTTPException(
            status_code=422,
            detail="Nights must be between 1 and 30",
        )

    hotel = db.get(Hotel, hotel_id)

    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")

    price = float(
        getattr(
            hotel,
            "price_per_night",
            getattr(hotel, "price", 0),
        ) or 0
    )

    booking = Booking(
        customer_name=customer_name,
        hotel_id=hotel_id,
        city=hotel.city,
        nights=nights,
        total_amount=price * nights,
    )

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Booking could not be saved",
        )


# --------------------------------------------------
# DEMO PAYMENT
# --------------------------------------------------

@app.post("/api/payments/simulate")
def simulate_payment(
    payload: dict,
    db: Session = Depends(get_db),
):
    try:
        booking_id = int(payload.get("booking_id", 0))
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="Invalid booking ID")

    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    payment = Payment(
        booking_id=booking.id,
        amount=float(booking.total_amount or 0),
        method=str(payload.get("method", "Demo UPI")),
        transaction_ref=f"WANDERLY-{uuid4().hex[:12].upper()}",
        status="Success",
    )

    try:
        db.add(payment)
        db.commit()
        db.refresh(payment)

        return {
            "id": payment.id,
            "booking_id": booking.id,
            "transaction_ref": payment.transaction_ref,
            "status": payment.status,
            "message": "Demo payment recorded. No real money was charged.",
        }
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Demo payment could not be recorded",
        )


# --------------------------------------------------
# ANALYTICS
# --------------------------------------------------

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    destinations = db.scalars(select(Destination)).all()
    hotels = db.scalars(select(Hotel)).all()
    bookings = db.scalars(select(Booking)).all()
    trips = db.scalars(select(Trip)).all()
    payments = db.scalars(select(Payment)).all()

    bookings_by_city = {}

    for booking in bookings:
        hotel = db.get(Hotel, booking.hotel_id)
        if hotel is None:
            continue

        city = hotel.city or "Other"

        bookings_by_city[city] = bookings_by_city.get(city, 0) + 1

    paid_revenue = sum(
        float(getattr(payment, "amount", 0) or 0)
        for payment in payments
        if str(getattr(payment, "status", "")).lower()
        in {"success", "paid", "completed"}
    )

    return {
        "destination_count": len(destinations),
        "hotel_count": len(hotels),
        "total_bookings": len(bookings),
        "total_trips": len(trips),
        "paid_revenue": paid_revenue,
        "bookings_by_city": [
            {"city": city, "bookings": count}
            for city, count in sorted(
                bookings_by_city.items(),
                key=lambda row: row[1],
                reverse=True,
            )
        ],
    }
