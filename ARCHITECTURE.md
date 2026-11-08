# Wanderly Architecture

```text
React Frontend
     |
     | HTTP/JSON
     v
FastAPI Backend
     |
     v
SQLAlchemy
     |
     v
PostgreSQL
```

## Main API routes

- `GET /api/health`
- `GET /api/destinations`
- `GET /api/hotels`
- `POST /api/planner`
- `POST /api/bookings`
- `GET /api/bookings`
- `POST /api/payments/simulate`
- `GET /api/dashboard`
- `GET /api/analytics`

The recommendation logic is a transparent rule-based academic implementation: it scores attractions using interest matching, budget fit and trip duration. This is presented as AI-assisted/recommendation functionality without claiming a trained machine-learning model.
