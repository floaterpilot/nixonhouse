# Architecture

**Phase 1 planning artifact.**

## Where the app lives

The Autonomous CFO is a **standalone application in `cfo/`** inside this repo.

Why not extend the existing dashboard (Express + React/Vite, `users.json`
auth, no database)?

- The CFO's security requirements (MFA, database-backed revocable sessions,
  audit logging, encrypted fields, account lockout) exceed what the
  dashboard's JWT-and-JSON-file setup can honestly provide, and retrofitting
  it would destabilize a working app.
- The CFO needs PostgreSQL and versioned historical data; the dashboard is
  deliberately database-free.
- Isolation keeps the blast radius small in both directions: a dashboard bug
  can never expose financial data, and CFO migrations can never break the
  dashboard.

The two apps can share the existing self-hosting path: the CFO's container
runs on the same Docker host and is exposed through the existing Cloudflare
Tunnel on its own subdomain (recommended: `cfo.nixonhouse.com`). Nothing else
is shared — separate auth, separate data, separate processes.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15 (App Router) + React + TypeScript** | One deployable unit; server components and route handlers give us a backend without a separately operated API service, which the build prompt permits when separation adds no meaningful benefit — at MVP scale it doesn't. |
| Database | **PostgreSQL 16** | Required by the prompt; right choice for versioned financial history. |
| ORM | **Prisma** | Typed schema, migration workflow, matches the prompt's default. |
| Auth | **better-auth** (database sessions) | Mature TypeScript auth for Next.js with the exact required feature set: scrypt password hashing, TOTP two-factor plugin, DB-backed sessions with per-session revocation, password reset, and built-in rate limiting for login endpoints. Auth.js/NextAuth was rejected because its JWT-session default makes true server-side session revocation awkward, and revocation is a hard requirement. No custom cryptography anywhere. |
| Validation | **Zod** at every input boundary (forms, route handlers, CSV import) | Single validation vocabulary shared client/server. |
| Money | Integer **cents** (`BigInt`/`Int` columns), never floats | Eliminates floating-point drift in financial math. Display formatting at the edge only. |
| Styling | Tailwind CSS, mobile-first | Fast, consistent, matches responsive requirement. |
| Charts | Recharts (simple line/area only) | "Simple charts" per UX requirements. |
| Tests | Vitest (unit/integration) + Playwright (e2e) | Standard, fast, CI-friendly. |
| Packaging | Dockerfile (multi-stage) + docker-compose (app + postgres) | Prompt requirement; self-host first, cloud-portable later. |

## Application structure

```
cfo/
  docs/                  ← this planning set, then living docs
  prisma/
    schema.prisma
    migrations/
    seed.ts              ← demonstration household
  src/
    app/                 ← Next.js App Router (screens + route handlers)
      (auth)/            ← sign-in, sign-up, security setup
      (app)/             ← authenticated shell: dashboard, afford, trends, …
      share/[token]/     ← public shareable purchase page (isolated layout)
      api/               ← route handlers where forms aren't enough
    domain/              ← PURE business logic, no I/O
      ffi/               ← immediate.ts, accessible.ts, lifetime.ts, confidence.ts
      recommend/         ← rules/, engine.ts, alternatives.ts, explain.ts
      constitution/      ← policy types + evaluation
      money.ts           ← cents arithmetic helpers
    server/              ← I/O layer: prisma client, auth config, audit writer,
                            share-token service, rate limiting, mailer
    components/          ← UI components
  tests/
    unit/  integration/  e2e/
  Dockerfile
  docker-compose.yml
  .env.example
```

The **`domain/` layer is pure and deterministic**: every FFI calculation and
recommendation is a function from an explicit input snapshot to a result.
This is what makes the audit requirement cheap to honor — we persist the
input snapshot, the assumption set, and a calculation version string with
every result, and any historical result can be recomputed and verified.

## Key architectural rules

1. **Determinism at the core.** No `Date.now()`, no randomness, no I/O inside
   `domain/`. The caller passes the clock and the data.
2. **Versioned calculations.** `CALC_VERSION` constants are bumped whenever a
   formula or assumption default changes; stored results keep the version they
   were computed with.
3. **Audit at the write path.** Every mutation of financial data, policies,
   recommendations, links, and security settings goes through a single
   `audit()` helper in `server/` — there is no second way to write.
4. **Share pages are a separate trust zone.** `share/[token]` uses its own
   minimal layout, queries only the denormalized `SharedPurchaseLink` payload
   (never joins into household data), sends `X-Robots-Tag: noindex`, and is
   rate limited.
5. **Least privilege in the DB.** The app connects as a role with only DML on
   app tables; migrations run as a separate role. No superuser at runtime.

## Deployment

- `docker compose up` for local dev: `postgres` + `web` services, volumes for
  data persistence, `.env` from `.env.example`.
- Production (initial): same compose file on the existing docker-vm host,
  published through Cloudflare Tunnel at `cfo.nixonhouse.com`. TLS terminates
  at Cloudflare; the tunnel is outbound-only so no inbound ports open.
- Migrations: `prisma migrate deploy` on release. Seed only ever runs on
  explicit command, never automatically in production.
- Backups: nightly `pg_dump` to the host's existing backup volume;
  restore procedure documented and tested in Phase 7.

## Environment variables (template)

`DATABASE_URL`, `MIGRATION_DATABASE_URL`, `AUTH_SECRET`, `APP_URL`,
`FIELD_ENCRYPTION_KEY` (AES-256-GCM key for sensitive columns),
`SMTP_HOST/PORT/USER/PASS/FROM` (optional in dev), `RATE_LIMIT_*` overrides.
No secrets in source control; `.env.example` carries names and comments only.
