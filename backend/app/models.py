
from datetime import datetime
from sqlalchemy import (
    String, Integer, Float, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class Destination(Base):
    __tablename__ = "destinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    state: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(100))
    rating: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text)
    estimated_daily_cost: Mapped[float] = mapped_column(Float, default=2500)


class Attraction(Base):
    __tablename__ = "attractions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    destination: Mapped[str] = mapped_column(String(100), index=True)
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(100))
    cost: Mapped[float] = mapped_column(Float, default=0)
    description: Mapped[str] = mapped_column(Text)


class Hotel(Base):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    city: Mapped[str] = mapped_column(String(100), index=True)
    price_per_night: Mapped[float] = mapped_column(Float)
    rating: Mapped[float] = mapped_column(Float)
    rooms_available: Mapped[int] = mapped_column(Integer, default=5)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    hotel_id: Mapped[int] = mapped_column(Integer)
    city: Mapped[str] = mapped_column(String(100))
    nights: Mapped[int] = mapped_column(Integer)
    total_amount: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default="Confirmed")
    payment_status: Mapped[str] = mapped_column(String(30), default="Pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    booking_id: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30))
    transaction_ref: Mapped[str] = mapped_column(String(80), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    destination: Mapped[str] = mapped_column(String(100), index=True)
    days: Mapped[int] = mapped_column(Integer)
    budget: Mapped[float] = mapped_column(Float)
    interest: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), index=True
    )
    day: Mapped[int] = mapped_column(Integer)
    activity: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(100))
    estimated_cost: Mapped[float] = mapped_column(Float, default=0)
    reason: Mapped[str] = mapped_column(Text, default="")
