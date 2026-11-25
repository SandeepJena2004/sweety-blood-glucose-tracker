# Sweety – Blood Glucose Tracker

A full-stack web application that allows diabetes patients to record, manage, and monitor their daily blood glucose readings. Built as a comprehensive healthcare dashboard with authentication, CRUD operations, validation, and reporting.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, JavaScript, Tailwind CSS |
| Backend | Node.js, Express.js, REST API |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Charts | Recharts |

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** v8 or higher

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/SandeepJena2004/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. PostgreSQL Database Setup

Create the databases in PostgreSQL:

```sql
CREATE DATABASE sweety;
CREATE DATABASE sweety_test;
```

### 4. Environment Variables

Copy the example environment file and update it with your database credentials:

```bash
# From the project root
cp .env.example server/.env
```

Edit `server/.env` with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety?schema=public"
DATABASE_URL_TEST="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public"
JWT_SECRET="your-secure-random-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

### 5. Run Database Migrations

```bash
cd server
npx prisma migrate dev --name init
```

### 6. Seed the Database

```bash
cd server
node prisma/seed.js
```

## Running the Application

### Start the backend server

```bash
cd server
npm run dev
```

The API server starts at `http://localhost:5000`.

### Start the frontend (in a separate terminal)

```bash
cd client
npm run dev
```

The frontend starts at `http://localhost:5173`.

## Running Tests

Tests require a separate test database. Set `DATABASE_URL` to your test database URL before running:

```bash
cd server

# On Windows (PowerShell)
$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public"
npx prisma db push
npm test

# On macOS/Linux
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public" npx prisma db push
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public" npm test
```

## Demo Account

After seeding, use these credentials to log in:

| Field | Value |
|-------|-------|
| Email | `demo@sweety.com` |
| Password | `demo1234` |

The seed script creates 30 days of sample glucose readings with realistic values.

## API Overview

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Readings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/readings` | Add a new reading |
| GET | `/api/readings` | List readings (paginated) |
| GET | `/api/readings/:id` | Get a single reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/api/reports/monthly?date=YYYY-MM-DD` | Previous month report |

### Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Validation Rules

1. **Glucose value is required** — "Please enter a glucose value."
2. **Value must be 40–600 mg/dl (whole number)** — "Value must be between 40 and 600 mg/dl."
3. **One reading per slot per day** — "You already have an [slot] reading for this date."
4. **Maximum 4 readings per day** — "You can add only 4 readings per day."
5. **Date cannot be in the future** — "Date cannot be in the future."

Validation is enforced on **both frontend and backend**. A database-level unique constraint on `(userId, date, slot)` provides an additional safety net.

## Time Slots

| Slot | Label |
|------|-------|
| `MORNING_FASTING` | Morning (fasting) |
| `AFTER_BREAKFAST` | After breakfast |
| `AFTER_LUNCH` | After lunch |
| `AFTER_DINNER` | After dinner |

## Project Structure

```
sweety/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API client
│   │   ├── hooks/             # Auth context
│   │   └── utils/             # Validation helpers
│   └── package.json
├── server/                    # Express.js backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Demo data seeder
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # Express routes
│   │   ├── middleware/        # Auth & error handling
│   │   ├── services/          # Business logic
│   │   ├── validators/        # Zod schemas
│   │   └── utils/             # Prisma client
│   ├── tests/                 # Vitest + Supertest tests
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Assumptions

1. **Single timezone**: The application uses the server's local date for "today" checks. Dates are stored as PostgreSQL `DATE` type and transmitted as `YYYY-MM-DD` strings to avoid timezone-related date shifting.
2. **Glucose unit**: All values are in mg/dl.
3. **Authentication**: JWT tokens are stored in `localStorage`. Token expiry is 7 days.
4. **Password requirements**: Minimum 6 characters. No special character requirements for a fresher-level project.
5. **Pagination**: Reading history defaults to 20 items per page.
6. **Previous month report**: Calculated relative to the selected date, covering the entire preceding calendar month.

## Future Improvements

- Password reset / forgot password flow
- Email verification on registration
- Data export (CSV/PDF)
- Glucose trend charts over time
- Push notifications for missed readings
- Dark mode support
- Mobile-first PWA
- Rate limiting on API endpoints
- Refresh token rotation
- Multi-language support
