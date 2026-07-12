# Implementation Roadmap

**Phase 1 planning artifact.** Phases match the build prompt. Each phase ends
with its tests green and docs updated; no phase starts on a broken base.

## Phase 1 — Read and Plan ✅ (this document set)

Requirements summary, ambiguities, architecture, data model, threat model,
FFI approach, engine rules, MVP/deferred scope, roadmap, decision log.
**Checkpoint: product-owner review before any code.**

## Phase 2 — Foundation

- Scaffold `cfo/` Next.js + TypeScript + Tailwind; Dockerfile, compose
  (web + postgres), `.env.example`, CI (lint, typecheck, test, `npm audit`).
- Prisma schema (full data model), initial migration, least-privilege DB
  roles, append-only grants on `AuditEvent`.
- better-auth: sign-up, sign-in, TOTP 2FA, password reset, lockout, session
  list/revoke, emergency lock. Security headers, rate limiting.
- `audit()` writer; redacting logger.
- Household + member CRUD; responsive app shell/navigation (mobile-first).
- Seed script (Hendersons).
- Tests: auth flows, session revocation, lockout, audit writes, header
  presence, cross-household isolation.

## Phase 3 — Financial Model

- Accounts + append-only balances; assets/liabilities via account types;
  income sources; spending categories + baselines; CSV import with review;
  upcoming obligations; goals (priority, protection, funding links).
- Financial Constitution UI + versioned policies; onboarding flow (the six
  PRD questions) that writes the initial Constitution.
- Screens: financial profile, accounts & balances, income & spending,
  goals, constitution, onboarding.
- Tests: validation, versioning behavior, import edge cases, policy audit.

## Phase 4 — FFI

- `domain/ffi/`: immediate, accessible, lifetime, confidence, safe-to-spend,
  attribution counterfactuals — pure functions + golden tests.
- Persisted `FfiCalculation` on data change + daily schedule; calculation
  detail view; assumption sets with override logging.
- Dashboard (headline numbers as time, confidence chips); Trends screen
  (short-term and long-term views, attribution split).
- Tests: golden files from documented sample inputs/outputs, guardrail
  property tests, confidence matrix.

## Phase 5 — Decision Engine

- `domain/recommend/`: rule pipeline R1–R10, explanation templates,
  alternative generators, purchase-impact FFI reruns, recovery time.
- Can We Afford It? flow + purchase result screen; recommendations screen;
  confirm/defer/override with `UserOverride` logging.
- Tests: golden decision matrix, property tests (monotonicity, R3
  inviolability), template rendering.

## Phase 6 — Sharing and Audit

- Shareable purchase pages: token issue/hash, frozen payload, expiry,
  revocation, view counts, noindex, rate limits; share management UI.
- Audit-history screen with filtering; calculation-detail drill-down from
  any historical FFI value.
- Data export (JSON), account deletion flow, six-month Progress Review
  generator.
- Tests: share authorization/expiration/revocation, payload contains no
  balances or names, export completeness, deletion.

## Phase 7 — Hardening

- Security review against the threat model; dependency audit; log-redaction
  verification; backup/restore drill.
- Accessibility review (keyboard, contrast, screen-reader labels on all 18
  screens); iPhone/iPad/desktop passes.
- e2e suite (Playwright): onboarding → afford → share → audit journey.
- Documentation completion: README, setup, architecture, data model,
  security + threat model (updated), FFI docs, rule docs, testing guide,
  deployment guide, known limitations, deferred list, decision log.

## Major risks

1. **Scope gravity** — the vision documents describe years of product; the
   MVP line in `07-mvp-scope.md` is the defense. Anything not listed there
   ships later.
2. **Trust in numbers** — a single wrong FFI figure costs more than a missing
   feature; mitigated by pure functions, golden tests, versioning, and the
   calculation-detail view that shows its work.
3. **Manual data entry fatigue** — without aggregation the user must maintain
   balances; mitigated by fast update UX and staleness-aware confidence, and
   it is the main post-MVP priority.
4. **Lifetime FFI credibility** — a simplified model can be challenged;
   mitigated by conservative defaults, visible assumptions, and ranges
   instead of dates.
5. **Solo-operator security** — self-hosting concentrates responsibility;
   mitigated by the hardening phase, encrypted backups, and the documented
   residual-risk list.
