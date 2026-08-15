# Database setup

RateSphere uses MySQL 8+. The schema is fully reproducible from scratch.

## 1. Create the schema

```bash
mysql -u root -p < schema.sql
```

This creates the `ratesphere` database and the `users`, `stores`, and `ratings` tables with the
necessary indexes, foreign keys, and constraints.

## 2. Seed development data

From the `backend/` directory (with `.env` configured — see `.env.example`):

```bash
npm run seed
```

This truncates and repopulates `users`, `stores`, and `ratings` with realistic fictional data:
1 admin, 5 normal users, 3 store owners, 5 stores, 35 ratings. All seeded accounts share the
password printed at the end of the script (development only — see root README).

## Schema overview

- **users** — `id, name, email (unique), password_hash, address, role (ADMIN|USER|STORE_OWNER), status (ACTIVE|SUSPENDED), created_at, updated_at`
- **stores** — `id, name, email, address, owner_id -> users.id, created_at, updated_at`
- **ratings** — `id, user_id -> users.id, store_id -> stores.id, rating (1-5), created_at, updated_at`, unique on `(user_id, store_id)` so a user has exactly one rating per store (resubmission updates it).
