# Wanderly — AI-Assisted Smart Tourism & Travel Management System

Product 16 implementation: an academic smart tourism portal using **React + FastAPI/Python + PostgreSQL**.

## What this project demonstrates

- Destination discovery and search
- Smart itinerary/travel planning
- Hotel discovery and simulated booking
- Simulated payment integration for academic demonstration
- Customer dashboard and trip history
- Tourism analytics dashboard
- Recommendation endpoint based on destination, budget, days and interests
- PostgreSQL persistence
- Responsive UI inspired by the supplied Wanderly prototype

> Payment is intentionally simulated. No real money is charged.
> Map pins are a visual/demo map area and do not require a paid map API.

## Requirements

- Node.js + npm
- Python 3.13
- PostgreSQL 14+ (or another recent PostgreSQL release)
- VS Code

## 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE wanderly;
```

Copy `backend/.env.example` to `backend/.env` and set your PostgreSQL username/password.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/wanderly
```

## 2. Backend

Open a VS Code terminal in the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If PowerShell blocks activation, you can run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

## 3. Frontend

Open a second VS Code terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (normally http://localhost:5173).

## Project structure

```text
Wanderly-Smart-Tourism-Product16/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   └── services.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── prototype/
│   └── wanderly-prototype.html
├── ARCHITECTURE.md
└── README.md
```

## Product 16 mapping

| Requirement | Implementation |
|---|---|
| Tourism requirement analysis | Destination, interest, budget and trip-planning inputs |
| Booking module | Hotel listing + booking endpoint |
| Travel planning | Smart itinerary generator |
| Payment integration | Simulated payment endpoint for academic demo |
| Dashboard | Customer trips + summary KPIs |
| Tourism analytics | Analytics cards + charts/tables |
| Testing | Manual test checklist in README |
| Deployment | Can be deployed after local verification |

## Demo flow for presentation

1. Search Hyderabad.
2. Select days, budget and interest.
3. Generate a smart itinerary.
4. Open Hotels and book a sample hotel.
5. Complete the simulated payment.
6. Open My Trips to show the booking.
7. Open Analytics to explain tourism statistics.

## Important

This is an academic/demo application. It does not connect to a real payment gateway or guarantee real hotel availability.
