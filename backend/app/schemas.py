from pydantic import BaseModel, Field

class PlannerRequest(BaseModel):
    destination: str
    days: int = Field(ge=1, le=30)
    budget: float = Field(gt=0)
    interest: str

class BookingRequest(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    hotel_id: int
    nights: int = Field(ge=1, le=30)

class PaymentRequest(BaseModel):
    booking_id: int
    method: str = "Demo UPI"
