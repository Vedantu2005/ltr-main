# RateSphere

A store rating & reputation platform. Users browse and rate registered stores (1–5 stars), store
owners track their reputation, and administrators manage the platform.

Built to the FullStack Intern Coding Challenge spec, with production-oriented polish: a distinctive
light/dark design system, server-side pagination/sorting/filtering, and hardened authentication.

## Features

**System Administrator**
- Dashboard with live counts (users, stores, ratings, average platform rating, active/suspended users) — all computed from the database on every request, never hardcoded
- Create users, admins, and store owners
- View/search/filter/sort paginated user and store listings
- View full user detail (including a store owner's average rating)
- Suspend / reactivate user accounts
- Create stores and assign a store owner

**Normal User**
- Register and log in
- Browse, search (name/address), and sort stores
- Submit a 1–5 star rating per store; resubmitting updates the existing rating (never a duplicate)
- View a store's average rating, rating distribution, and their own submitted rating
- Change password, view profile

**Store Owner**
- Dashboard: average rating, total ratings, rating distribution, and the list of users who rated their store
- Change password, view profile

**Platform-wide**
- Single login for all roles, JWT-based, role derived server-side (never trusted from the client)
- Light theme by default, with a persisted dark-mode toggle
- Server-side pagination, search, and whitelisted sortable columns on every listing
- Accessible star-rating component (keyboard operable, ARIA radiogroup)
- Toasts, skeleton loaders, and empty states throughout

## Architecture

```
ltr-main/
├── backend/                 Express API
│   ├── src/
│   │   ├── config/          env + mysql2 pool
│   │   ├── middleware/      authenticate/authorize, error handler, rate limiter
│   │   ├── routes/          auth, stores, admin, store-owner
│   │   ├── controllers/     thin HTTP layer
│   │   ├── services/        business logic + SQL (parameterized)
│   │   └── validators/      express-validator chains
│   ├── database/            schema.sql, seed.js, README.md
│   └── tests/                Jest + Supertest (39 tests)
└── frontend/                 React (Vite) SPA
    └── src/
        ├── api/              axios client + per-resource modules
        ├── context/           Auth / Theme / Toast
        ├── layouts/            AuthLayout, DashboardLayout
        ├── pages/              auth, admin, user, store-owner
        ├── components/         ui/ (Button, DataTable, StarRating, ...), admin/, store/
        └── routes/             ProtectedRoute, RoleRoute
```

Request flow: `routes → controllers → services → mysql2 pool`. Controllers never contain SQL or
business rules; services never touch `req`/`res`.

```
Browser (React SPA)
   │  Axios + JWT bearer token
   ▼
Express API  ──authenticate()──▶  authorize(...roles)  ──▶  controller ──▶ service ──▶ MySQL
   │
   └── Helmet, CORS (CLIENT_URL only), rate limiting on /api/auth/*
```

## Database schema

MySQL 8+, database name `ratesphere`. Three tables:

- **users** — `id, name, email (unique), password_hash, address, role (ADMIN|USER|STORE_OWNER), status (ACTIVE|SUSPENDED), created_at, updated_at`
- **stores** — `id, name, email, address, owner_id → users.id, created_at, updated_at`
- **ratings** — `id, user_id → users.id, store_id → stores.id, rating (1–5), created_at, updated_at`, `UNIQUE(user_id, store_id)`

The unique constraint on `(user_id, store_id)` is what guarantees "one rating per user per store" —
resubmission is an `INSERT ... ON DUPLICATE KEY UPDATE`, not application-level dedup logic. See
[backend/database/README.md](backend/database/README.md) for setup commands and
[backend/database/schema.sql](backend/database/schema.sql) for the full DDL, indexes, and constraints.

## Authentication & authorization flow

1. `POST /api/auth/login` verifies the bcrypt hash, then signs a JWT containing `{ userId, role, email }`.
2. Every protected request sends `Authorization: Bearer <token>`.
3. `authenticate()` middleware verifies the JWT **and** re-fetches the user row from the database on
   every request — a suspended account is rejected immediately, even with a still-valid token.
4. `authorize('ADMIN')` (etc.) checks the role attached by `authenticate()`. The frontend never sends
   a role the backend trusts; role always comes from the verified, server-issued token.

## Security

- Passwords hashed with bcrypt (cost 12), never returned in any API response (verified by an automated test)
- JWT auth with server-side role verification (RBAC) on every protected route
- Helmet, CORS locked to `CLIENT_URL`, `express-rate-limit` on `/api/auth/*`
- 100% parameterized SQL (`mysql2` placeholders) — no string-concatenated queries anywhere
- `sortBy`/`order` on every listing endpoint validated against a field whitelist before being interpolated into `ORDER BY`
- express-validator on every mutating endpoint (name 20–60 chars, address ≤400, password 8–16 with uppercase + special character, RFC-shaped email)
- Centralized error handler — no stack traces leaked in responses
- Account suspension enforced at the authentication layer, not just in the UI

## Tech stack

- **Backend**: Node.js, Express, mysql2, JWT, bcrypt, express-validator, Helmet, CORS, express-rate-limit
- **Database**: MySQL 8+
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios, Lucide icons
- **Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Getting started

### 1. Database

```bash
mysql -u root -p < backend/database/schema.sql
```

See [backend/database/README.md](backend/database/README.md) for details.

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in DB_PASSWORD and a real JWT_SECRET
npm install
npm run seed               # optional: realistic dev data (1 admin, 5 users, 3 store owners, 5 stores, 35 ratings)
npm run dev                 # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

## Development credentials (seed data)

> DEVELOPMENT ONLY — created by `npm run seed`, never used in production. Password for every seeded account: `DevPass123!`

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@ratesphere.dev` | |
| Normal user | `marcus.rodriguez@example.com` | |
| Store owner | `gabriella.sinclair@example.com` | owns Northbound Coffee Roasters |
| Store owner | `theo.kowalczyk@example.com` | owns Kowalczyk Hardware & Supply |
| Store owner | `amara.adebayo@example.com` | owns Adebayo Fine Fabrics |

### Logging in

With both dev servers running (backend on `:5000`, frontend on `:5173`):

1. Open [http://localhost:5173/login](http://localhost:5173/login)
2. Enter the email from the table above and the password `DevPass123!`
3. Click **Sign in** — you're redirected by role: admin → `/admin` (Overview, Users, Stores),
   normal user → `/stores`, store owner → `/store-owner`

## Testing

**Backend** (`cd backend && npm test`) — 39 tests, run against a real MySQL database
(`ratesphere_test`), covering: registration/login/JWT validation, RBAC across all three roles,
duplicate-email/invalid-input/admin-creation, store creation with owner-role validation, rating
range/duplicate/average-recalculation, and security (unauthenticated access, malformed tokens,
suspended accounts, `password_hash` never leaking, SQL-injection-shaped input).

Actual result, last run:
```
Test Suites: 6 passed, 6 total
Tests:       39 passed, 39 total
```

**Frontend** (`cd frontend && npm test`) — 24 tests (Vitest + React Testing Library): registration
validation rules, star-rating keyboard/click interaction, theme toggle + persistence, pagination
behavior, protected-route redirects, and the login form's success/error paths.

Actual result, last run:
```
Test Files  6 passed (6)
Tests       24 passed (24)
```

Both suites were also verified against a **real, running instance** — a Playwright script logged in
as each of the three seeded roles, exercised search/filtering/rating submission, confirmed a normal
user is redirected away from `/admin`, and confirmed zero browser console errors throughout.

## API documentation

No Swagger/OpenAPI UI is included (out of scope for this build). Route definitions in
`backend/src/routes/*.routes.js` are the source of truth; every response follows the envelope:

```json
{ "success": true, "data": {}, "message": "optional" }
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
{ "success": false, "message": "You have already rated this store" }
```

## Deployment notes

Step-by-step deployment guide (Railway for backend + MySQL, Vercel for frontend): [DEPLOYMENT.md](DEPLOYMENT.md).

- Backend reads all configuration from environment variables (`backend/.env.example`) — no
  hardcoded `localhost` assumptions in application code. Deployable to Render/Railway/any Node host
  with a reachable MySQL 8 instance.
- Frontend reads `VITE_API_URL` at build time — deployable to Vercel/any static host, pointed at the
  deployed API.
- `.gitignore` excludes `.env`, `node_modules/`, and build output.

## Known limitations / explicitly out of scope

Agreed with the requester before building: **no OAuth/social login, no transactional email (so no
forgot/reset-password flow), no notifications table/UI, no audit log, no Swagger UI, no CSV export.**
These can be layered on without restructuring the existing architecture.

- A store owner account is assumed to own at most one store for dashboard purposes (the schema
  supports multiple; the dashboard shows the first).
- Store name has no minimum-length validation (only the 60-character column limit) since the spec's
  20–60 character rule is specified for user names, not store names.
