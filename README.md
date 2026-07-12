# NixonHouse

Personal homelab dashboard at `nixonhouse.com`. Private, single-user, JWT-authenticated.

## Stack

- **Frontend**: React + Vite + Tailwind CSS (deploy to Vercel/Netlify)
- **Backend**: Node.js + Express (self-hosted via Cloudflare Tunnel)
- **Auth**: JWT with bcrypt, no database

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set ADMIN_USER, ADMIN_PASSWORD_HASH, JWT_SECRET
# Generate password hash:
node -e "require('bcrypt').hash('yourpassword', 10).then(console.log)"
npm start
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your service URLs
npm run dev
```

### Production (PM2)

```bash
cd backend && npm install --omit=dev
pm2 start server.js --name nixonhouse-api
pm2 save
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Entry point, no public access |
| Home | `/` | Search + weather + quick links |
| Links | `/links` | Bookmark grid by category |
| Media | `/media` | Jellyfin search + service tiles |
| Finance | `/finance` | Category budget pace tracking + planned-expense forecasting, backed by Actual Budget |
| Cubs | `/cubs` | MLB scoreboard — Wrigley aesthetic |
| Sports | `/sports` | Tennessee football (Aug–Jan only) |
| News | `/news` | 5-day forecast + headlines |

## Data Sources

- Weather: [Open-Meteo](https://open-meteo.com) (free, no key)
- Cubs: [MLB Stats API](https://statsapi.mlb.com/api/v1/) + ESPN RSS
- Tennessee: ESPN unofficial API + RSS
- News: BBC RSS, NYT RSS, The Verge RSS, Ars Technica RSS
- Finance: your self-hosted [Actual Budget](https://actualbudget.org) server via `@actual-app/api` (read-only — this app never writes to Actual)

## Finance Module

The Finance module (`/finance`) treats your self-hosted Actual Budget instance as the source
of truth for categories, budgets, and transactions — it never writes back to Actual. It adds
two things Actual doesn't do natively:

- **Pace tracking**: for each category, whether you're ahead or behind a linear daily spend
  pace, given the current day of the month.
- **Forecasting**: log a planned/upcoming expense (description, amount, category, date) and
  see a projected remaining balance if it happens. Planned expenses are stored locally per
  user (`backend/data/planned-expenses-<username>.json`) since Actual has no equivalent
  concept. Marking one "paid" just clears it from the forecast — it does not create a
  transaction in Actual, so continue logging/syncing the real transaction there as usual.

Configure `ACTUAL_SERVER_URL`, `ACTUAL_PASSWORD`, and `ACTUAL_SYNC_ID` in `backend/.env` (see
`backend/.env.example`). `ACTUAL_DATA_DIR` and `backend/data/` (planned expenses) must live on
a **persistent volume** in your `docker-vm` deployment — without one, the Actual budget cache
re-downloads on every container restart and planned expenses are lost.

## PWA / Home Screen Install

The whole app is installable via Safari's "Add to Home Screen" on iPhone/iPad — it registers
a service worker that caches the static app shell only. API/auth requests (`/api/*`,
`/auth/*`) are always network-only, so finance and other live data is never served stale.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.
