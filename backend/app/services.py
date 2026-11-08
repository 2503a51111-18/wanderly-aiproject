from sqlalchemy import select, func
from .models import Destination, Attraction, Hotel, Booking, Payment

def build_plan(db, destination: str, days: int, budget: float, interest: str):
    dest = db.scalar(select(Destination).where(func.lower(Destination.name) == destination.lower()))
    if not dest:
        return {"destination": destination, "days": days, "budget": budget, "interest": interest,
                "message": "Destination not found in the demo database. Try Hyderabad, Goa, Kerala or Jaipur.",
                "itinerary": []}

    attractions = db.scalars(select(Attraction).where(func.lower(Attraction.destination) == dest.name.lower())).all()
    scored = []
    for a in attractions:
        score = 1
        if interest.lower() in a.category.lower():
            score += 4
        if a.cost <= budget / max(days, 1):
            score += 2
        scored.append((score, a))
    scored.sort(key=lambda x: (-x[0], x[1].name))

    chosen = [a for _, a in scored]
    itinerary = []
    for day in range(1, days + 1):
        a = chosen[(day - 1) % len(chosen)] if chosen else None
        itinerary.append({
            "day": day,
            "activity": a.name if a else "Explore local attractions",
            "category": a.category if a else interest,
            "estimated_cost": a.cost if a else 0,
            "reason": f"Matches your {interest} interest and fits the demo budget rules." if a else "General recommendation"
        })
    return {"destination": dest.name, "days": days, "budget": budget, "interest": interest,
            "daily_estimate": dest.estimated_daily_cost, "itinerary": itinerary}

def analytics(db):
    bookings = db.scalar(select(func.count(Booking.id))) or 0
    revenue = db.scalar(select(func.coalesce(func.sum(Payment.amount), 0.0)).where(Payment.status == "Paid")) or 0
    cities = db.execute(select(Booking.city, func.count(Booking.id)).group_by(Booking.city)).all()
    hotels = db.scalar(select(func.count(Hotel.id))) or 0
    destinations = db.scalar(select(func.count(Destination.id))) or 0
    return {
        "total_bookings": bookings,
        "paid_revenue": float(revenue),
        "hotel_count": hotels,
        "destination_count": destinations,
        "bookings_by_city": [{"city": c, "bookings": n} for c, n in cities]
    }
