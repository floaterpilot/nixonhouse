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
| Cubs | `/cubs` | MLB scoreboard — Wrigley aesthetic |
| Sports | `/sports` | Tennessee football (Aug–Jan only) |
| News | `/news` | 5-day forecast + headlines |

## Data Sources

- Weather: [Open-Meteo](https://open-meteo.com) (free, no key)
- Cubs: [MLB Stats API](https://statsapi.mlb.com/api/v1/) + ESPN RSS
- Tennessee: ESPN unofficial API + RSS
- News: BBC RSS, NYT RSS, The Verge RSS, Ars Technica RSS

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.
