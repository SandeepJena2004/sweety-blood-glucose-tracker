# Sweety – Blood Glucose Tracker

A full-stack web application for recording, managing, and reviewing daily blood glucose measurements across four structured time slots.

> **Disclaimer:** Sweety is a personal glucose tracking application built for educational and demonstration purposes. It is not medically certified, does not provide medical diagnoses or clinical recommendations, and is not intended for production clinical use.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, JavaScript, Tailwind CSS v4, Lucide React, Recharts |
| Backend | Node.js 24, Express.js 5, REST API |
| Database | PostgreSQL 18.7, Prisma ORM 6 |
| Authentication | JWT (`jsonwebtoken`), `bcrypt` |
| Validation | Zod |
| Testing | Vitest 5, Supertest 7 |

## Frontend Features

- **Custom Slate & Cyan Design System:** Clean `#F1F5F9` canvas, `#FFFFFF` surfaces, `#0E7490` primary accents, `#E2E8F0` borders, and DM Sans typography via CSS design tokens.
- **Custom Branding & Icons:** Original SVG blood-droplet pulse logo (`sweety.` / `Glucose Journal`), matching SVG favicon, and consistent Lucide React icons.
- **Split-Screen Authentication:** Responsive split-screen login and registration pages with a deep cyan branding panel, abstract pulse-line illustration, and password visibility toggles.
- **Responsive Navigation:** Compact left sidebar on desktop and collapsible top-bar drawer on mobile with active-route indicators, user initials avatar, and sign-out action.
- **Personalised Dashboard:** Dynamic greeting and current date, neutral summary statistic cards, a four-slot daily glucose journal (`Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`), daily completion progress bar (`X of 4 slots recorded`), and direct add-reading links for unrecorded slots.
- **Date-Grouped Reading History:** Compact daily sections displaying the recorded slot count (`X of 4 slots`), accessible edit and delete actions with confirmation, and pagination.
- **Accessible Add & Edit Form:** Keyboard-accessible time-slot selection tiles, inline `mg/dL` unit indicator, range helper text (`40–600 mg/dL`, whole numbers), and client/server validation feedback.
- **Reports:** Daily, Month-to-Date, and Previous-Month summary views with a Slate & Cyan bar chart and breakdown for daily reports, plus empty-state handling. *(Monthly trend charts are not implemented because the existing report endpoints return aggregate summary statistics rather than per-day time-series data.)*

## Prerequisites

- **Node.js:** v24 recommended (tested on Node.js v24.11.0; minimum Node.js v20.19+ or v22.12+ required by Vite 8 and Express 5)
- **npm:** v10+ (tested on npm 11.3.0)
- **PostgreSQL:** v14 or higher

## First-Time Setup

### 1. Clone the repository

```bash
git clone https://github.com/SandeepJena2004/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Install dependencies

Use `npm ci` for reproducible installs from the committed lockfiles:

From `server/`:

```bash
cd server
npm ci
```

From `client/`:

```bash
cd ../client
npm ci
```

### 3. Create PostgreSQL databases

Create both the development database (`sweety_db`) and the isolated test database (`sweety_test`) in PostgreSQL:

```sql
CREATE DATABASE sweety_db;
CREATE DATABASE sweety_test;
```

### 4. Configure environment variables

Copy `.env.example` from the project root into `server/.env`:

**macOS / Linux** (from project root):

```bash
cp .env.example server/.env
```

**Windows PowerShell** (from project root):

```powershell
Copy-Item .env.example server\.env
```

Edit `server/.env` with your local PostgreSQL credentials and a secure `JWT_SECRET`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_db?schema=public"
DATABASE_URL_TEST="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

> **Password encoding note:** Special characters in PostgreSQL passwords must be URL-encoded inside connection URLs. For example, `@` must be written as `%40` (e.g., `my@pass` becomes `my%40pass`).

### 5. Apply database migrations

Apply the existing committed Prisma migrations to the development database (`sweety_db`) from `server/`:

```bash
cd server
npx prisma migrate deploy
```

### 6. Seed the development database (optional)

> **Warning:** `npm run db:seed` deletes all existing users and readings from `sweety_db` before inserting sample data. It is intended for local demonstration and development only, and will refuse to run if `NODE_ENV=test` or if `DATABASE_URL` does not point to `sweety_db`.

From `server/`:

```bash
npm run db:seed
```

This creates a demo user and 30 days of sample glucose readings.

## Demo Account

After running `npm run db:seed`, you can sign in with:

| Field | Value |
|---|---|
| Email | `demo@sweety.com` |
| Password | `demo1234` |

## Running the Application

Start the backend and frontend in separate terminals.

### Backend API (`server/`)

```bash
cd server
npm run dev
```

The API server runs at `http://localhost:5000`.

### Frontend (`client/`)

```bash
cd client
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

### Frontend Production Build (`client/`)

To create an optimised production bundle in `client/dist/`:

```bash
cd client
npm run build
```

## Automated Testing

Automated tests use **Vitest** and **Supertest** against the isolated `sweety_test` database.

### How database isolation works

- `npm test` sets `NODE_ENV=test` via `vitest.config.js` and `tests/setup.js`.
- `server/src/utils/prisma.js` and `server/tests/setup.js` both validate that `DATABASE_URL_TEST` is set and points to the database named `sweety_test`.
- If `DATABASE_URL_TEST` is missing or points to any other database (such as `sweety_db`), the test suite aborts immediately before any cleanup or test runs.

### Apply migrations to `sweety_test`

Before running tests for the first time (or after new migrations are pulled), apply the committed migrations to `sweety_test` in a temporary subshell/command so `DATABASE_URL` in your current shell and `server/.env` remain unchanged:

**Windows PowerShell** (from `server/`):

```powershell
powershell -NoProfile -Command '$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public"; npx prisma migrate deploy'
```

**macOS / Linux** (from `server/`):

```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_test?schema=public" npx prisma migrate deploy
```

### Run the test suite

From `server/`:

```bash
npm test
```

**Verified test result:** 31 automated API tests passed (`10` authentication tests, `14` reading CRUD tests, and `7` report tests).

## API Overview

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Service health check |

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive a JWT token |
| GET | `/api/auth/me` | Yes | Get the authenticated user profile |

### Readings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/readings` | Yes | Create a reading |
| GET | `/api/readings` | Yes | List readings (`page`, `limit`, `date`, `slot` query params) |
| GET | `/api/readings/:id` | Yes | Get a single reading owned by the user |
| PUT | `/api/readings/:id` | Yes | Update a reading owned by the user |
| DELETE | `/api/readings/:id` | Yes | Delete a reading owned by the user |

### Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Yes | Daily summary and slot readings |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Yes | Month-to-date summary through `date` |
| GET | `/api/reports/monthly?date=YYYY-MM-DD` | Yes | Previous calendar month summary relative to `date` |

### Response Format

Success response:

```json
{
  "success": true,
  "data": {
    "count": 3,
    "average": 116.7,
    "highest": 140,
    "lowest": 90
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

## Validation Rules

Enforced on both frontend and backend (with a database-level unique constraint on `(user_id, date, slot)`):

1. **Glucose value required:** `"Please enter a glucose value."`
2. **Whole number between 40 and 600 mg/dL:** `"Value must be between 40 and 600 mg/dl."`
3. **One reading per slot per day:** `"You already have an [slot] reading for this date."`
4. **Maximum four readings per day:** `"You can add only 4 readings per day."`
5. **No future dates:** `"Date cannot be in the future."`

## Time Slots

| Enum Value | Label |
|---|---|
| `MORNING_FASTING` | Morning (fasting) |
| `AFTER_BREAKFAST` | After breakfast |
| `AFTER_LUNCH` | After lunch |
| `AFTER_DINNER` | After dinner |

## Project Structure

```text
Sweety/
├── client/                              # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg                  # Custom SVG droplet favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx           # Split-screen authentication shell
│   │   │   ├── BrandLogo.jsx            # Droplet SVG logo & wordmark
│   │   │   ├── EmptyState.jsx           # Empty-state UI component
│   │   │   ├── Layout.jsx               # Authenticated app layout
│   │   │   ├── ProtectedRoute.jsx       # Route auth guard
│   │   │   ├── ReadingCard.jsx          # Reading row & slot icon helper
│   │   │   ├── Sidebar.jsx              # Desktop sidebar & mobile drawer
│   │   │   └── StatCard.jsx             # Summary statistic card
│   │   ├── hooks/
│   │   │   └── useAuth.jsx              # Authentication context & hook
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Daily overview & 4-slot journal
│   │   │   ├── Login.jsx                # Sign-in page
│   │   │   ├── ReadingForm.jsx          # Add/edit reading form
│   │   │   ├── ReadingHistory.jsx       # Date-grouped reading history
│   │   │   ├── Register.jsx             # Registration page
│   │   │   └── Reports.jsx              # Daily, MTD & previous-month reports
│   │   ├── services/
│   │   │   └── api.js                   # Axios client & API helpers
│   │   ├── utils/
│   │   │   └── validation.js            # Client-side validation & date helpers
│   │   ├── App.jsx
│   │   ├── index.css                    # Design tokens & Tailwind v4 styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
├── server/                              # Express.js backend
│   ├── prisma/
│   │   ├── migrations/                  # Committed Prisma SQL migrations
│   │   ├── schema.prisma                # PostgreSQL schema
│   │   └── seed.js                      # Development database seeder
│   ├── src/
│   │   ├── controllers/                 # HTTP request handlers
│   │   ├── middleware/                  # JWT auth & error handling
│   │   ├── routes/                      # Express route definitions
│   │   ├── services/                    # Business logic
│   │   ├── utils/
│   │   │   └── prisma.js                # Environment-aware Prisma singleton
│   │   ├── validators/                  # Zod validation schemas
│   │   ├── app.js                       # Express app configuration
│   │   └── server.js                    # Server entry point
│   ├── tests/
│   │   ├── api.test.js                  # 31 API integration tests
│   │   └── setup.js                     # Global test DB guard & cleanup
│   ├── package.json
│   ├── package-lock.json
│   └── vitest.config.js
├── .env.example
├── .gitignore
└── README.md
```

## Assumptions

1. **Timezone handling:** Dates are stored as PostgreSQL `DATE` values and exchanged as `YYYY-MM-DD` strings to avoid timezone-related date shifting; "today" validation uses the server's local date.
2. **Glucose unit:** All measurements are recorded in `mg/dL`.
3. **Authentication:** JWT tokens are stored in `localStorage` with a default expiry of `7d`.
4. **Password policy:** Registration requires a minimum of 6 characters; name is required up to 100 characters.
5. **Pagination:** Reading history defaults to 20 items per page.
6. **Previous month report:** Calculated as the full calendar month preceding the selected date.

## Future Improvements *(Not Implemented)*

- Password reset / forgot password flow
- Email verification on registration
- Multi-day / monthly glucose trend charts backed by time-series report endpoints
- Data export (CSV / PDF)
- API rate limiting
- Refresh token rotation
- Internationalisation and dark mode support
