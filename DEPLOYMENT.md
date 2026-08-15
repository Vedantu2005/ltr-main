# Deploying RateSphere (Railway + Vercel)

This walks through deploying the backend + MySQL on Railway and the frontend on Vercel. Both have
free/trial tiers sufficient for this project. You'll need a GitHub account (already used to host
[Vedantu2005/Roxiler-main](https://github.com/Vedantu2005/Roxiler-main)), a Railway account, and a
Vercel account — sign up for both with "Continue with GitHub" to keep it simple.

The steps that involve clicking through a hosting dashboard have to happen on your end — an
assistant can't complete OAuth logins or click buttons in your account. Everything else (config
files, commands to run) is already in the repo or spelled out below.

---

## Part 1 — Backend + MySQL on Railway

### 1. Create the project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select `Vedantu2005/Roxiler-main`
3. Railway creates one service pointed at the repo root. Open it → **Settings** → **Root Directory** → set to `backend`
4. Under **Settings → Networking**, click **Generate Domain** so the backend gets a public URL like `https://roxiler-main-production.up.railway.app`

### 2. Add a MySQL database

1. In the same project, click **+ New** → **Database** → **Add MySQL**
2. This creates a second service (named `MySQL`) in the project, with its own connection variables

### 3. Configure the backend's environment variables

On the backend service → **Variables** tab, add these (the `${{MySQL....}}` syntax references the
MySQL service's variables directly — Railway resolves them automatically, so you never type the
actual host/password):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `http://localhost:5173` *(temporary — you'll update this in Part 3)* |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_NAME` | `ratesphere` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `JWT_SECRET` | a long random string — generate one, don't reuse your local dev secret |
| `JWT_EXPIRES_IN` | `1d` |
| `BCRYPT_SALT_ROUNDS` | `12` |

Note `DB_NAME` is `ratesphere`, not `${{MySQL.MYSQLDATABASE}}` — Railway's MySQL plugin provisions
a default `railway` database, but a single MySQL server can host multiple databases, and
`schema.sql` creates its own `ratesphere` database on whatever server it's pointed at. Setting
`DB_NAME` explicitly keeps this consistent with local dev.

For `JWT_SECRET`, generate one instead of reusing anything from your local `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Railway auto-deploys once variables are saved (Nixpacks detects the Node app and runs `npm start`
per `backend/railway.json`).

### 4. Load the schema against Railway's MySQL

Get the **public** connection details (different from the internal `${{MySQL...}}` values used
above) from the MySQL service → **Connect** tab → **Public Network** — a host like
`something.proxy.rlwy.net`, a port, and the root password.

From your machine, using the same `mysql` client already used for local setup:

```bash
mysql -h <public-host> -P <public-port> -u root -p < backend/database/schema.sql
```
(paste the public password when prompted). This creates the `ratesphere` database and its tables
on Railway's MySQL server.

Optional — seed realistic dev data the same way:
```bash
cd backend
DB_HOST=<public-host> DB_PORT=<public-port> DB_USER=root DB_PASSWORD=<public-password> DB_NAME=ratesphere node database/seed.js
```

### 5. Verify the backend is up

```bash
curl https://<your-railway-domain>/api/health
```
Should return `{"success":true,"message":"RateSphere API is running","env":"production"}`.

---

## Part 2 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import `Vedantu2005/Roxiler-main`
2. **Root Directory**: `frontend`
3. Framework Preset should auto-detect as **Vite** (build command `npm run build`, output `dist`) — `frontend/vercel.json` is already in the repo so client-side routes (`/admin`, `/stores/5`, etc.) don't 404 on refresh
4. **Environment Variables** → add:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-railway-domain>/api` |
5. **Deploy**. Vercel gives you a URL like `https://roxiler-main.vercel.app`

---

## Part 3 — Close the CORS loop

The backend's `CLIENT_URL` env var controls which origin is allowed through CORS. Now that you have
the real Vercel URL:

1. Back on Railway → backend service → **Variables** → update `CLIENT_URL` to your Vercel URL (e.g. `https://roxiler-main.vercel.app`, no trailing slash)
2. Railway redeploys automatically on variable change

---

## Verify end-to-end

1. Open your Vercel URL, log in with the seeded admin (`admin@ratesphere.dev` / `DevPass123!`, if you seeded)
2. Open browser dev tools → Network tab → confirm API calls go to your Railway domain and return `200`, not blocked by CORS
3. Try a few flows: search stores, submit a rating, toggle theme, refresh on a nested route like `/admin/users` (should not 404)

## Troubleshooting

- **CORS error in the browser console**: `CLIENT_URL` on Railway doesn't exactly match the Vercel origin (check for a trailing slash or `http` vs `https`).
- **502 / backend unreachable right after deploy**: Railway's free tier can cold-start; wait ~30s and retry. Check the service's **Deployments → Logs** tab for the actual error.
- **`ER_ACCESS_DENIED` or connection refused on schema load**: you're using the internal `${{MySQL...}}` host instead of the public one from the Connect tab — the public host is required for connections from outside Railway's network.
- **Vercel build fails**: confirm Root Directory is `frontend`, not the repo root (a Vite project at the repo root doesn't exist here, it's nested).
- **Frontend loads but every API call 404s**: `VITE_API_URL` is baked in at build time — if you set/changed it after the first deploy, trigger a new Vercel deployment (redeploy), a plain env-var save alone won't rebuild the bundle.
