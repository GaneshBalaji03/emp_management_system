# Team49 – Employee Lifecycle & Compliance Management System

## Tech Stack

- Frontend: React (Vite), React Router, Bootstrap 5, Chart.js
- Backend: Django (JSON REST-style APIs), CORS enabled
- Database: MySQL

## Features

- Authentication (Password + OTP)
- Employee CRUD + Soft Exit (no hard delete)
- Onboarding tracking
- Document tracking + verification status
- Role/CTC history
- Compliance dashboard + alerts
- Reports & charts

## Local Setup

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill .env with your database connection info and any external
# authentication endpoints (LOGIN_THROUGH_PASSWORD_URL, FORGET_PASSWORD_URL,
# REGISTER_URL, SEND_OTP_URL, VERIFY_OTP_URL).
python manage.py runserver 8000
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:5173

## Notes

- Do NOT commit real secrets (DB password, keys) into GitHub.
- Keep `.env` files local; commit only `.env.example`.
