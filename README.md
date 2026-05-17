# Nixon House

Private landing page and homelab launchpad for `nixonhouse.com`.

## What is included

- Password login with secure `scrypt` hashes.
- First-login password change flow for temporary passwords.
- No public user signup route.
- Admin-only `/admin` section for creating users and resetting passwords.
- File-backed local storage under `data/`.
- Authenticated dashboard sections for Lakewood Ranch weather, radar, hourly precipitation, Cubs links, news, media, Spotify, Paperless, and house services.

## Run locally

```bash
node server.mjs
```

The app listens on `http://localhost:3000` by default.

## Create or reset the first admin

```bash
node scripts/bootstrap-user.mjs --username matt --display-name Matt --admin --force-change
```

The command prints a temporary password, stores its hash in `data/users.json`, and marks the account so the password must be changed on first login.

## Configuration

Copy `.env.example` to `.env` on the server and adjust values as needed. The app reads standard environment variables directly; if you use a process manager, load `.env` there.

Important settings:

- `PUBLIC_URL=https://nixonhouse.com`
- `COOKIE_SECURE=true` when served over HTTPS
- `NIXONHOUSE_SECRET` for encrypting per-user OAuth tokens
- `WEATHER_LABEL`, `WEATHER_LAT`, `WEATHER_LON`, `RADAR_STATION`, `RADAR_URL` for the dashboard weather card
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` for per-user Spotify connections
- `NIXONHOUSE_DATA_DIR` for persistent runtime storage outside the repo

## Spotify

Nixon House does not store Spotify passwords. Each signed-in user connects through Spotify OAuth, and the app stores that user's encrypted refresh token under `data/users.json`.

To enable it:

1. Create a Spotify app in the Spotify Developer Dashboard.
2. Add `https://nixonhouse.com/spotify/callback` as a redirect URI.
3. Set the Spotify environment variables above and restart the app.

## Deployment notes

Keep `data/users.json` and `data/sessions.json` private and backed up. They are intentionally ignored by git.

For a homelab deployment, run this behind a reverse proxy such as Caddy, nginx, or Traefik with HTTPS enabled and `COOKIE_SECURE=true`.
