# MVP Scope and Deferred Requirements

**Phase 1 planning artifact.**

## In the MVP

**Foundation**: email/password auth with TOTP 2FA, DB-backed sessions with
per-session revocation, lockout/progressive delays, password reset, emergency
lock mode, household profile, append-only audit log, security headers, rate
limiting, field-level encryption for sensitive text, Docker/compose
deployment, seed household.

**Financial model**: manual accounts + balance history, income sources,
essential/lifestyle spending baselines, optional CSV transaction import with
category review, goals with priority/protection, upcoming obligations,
Financial Constitution with the nine initial policy types (append-only
versioned).

**FFI**: Immediate FFI, Accessible FFI (with tax/volatility/selling-cost
haircuts), simplified three-scenario Lifetime FFI (percent funded +
work-optional age range), confidence levels everywhere, persisted auditable
calculations, calculation-detail view, 30-day/90-day/6-month and
1-year/5-year/target-age trend views, market-vs-behavior-vs-income
attribution, safe-to-spend.

**Decisions**: Can We Afford It? flow, deterministic rules engine, full
recommendation format (decision/why/immediate/long-term/FFI before-after/
confidence/alternatives/required action), confirm/defer/override with
logging, recommendations screen with expiries.

**Sharing**: private shareable purchase pages — hashed 256-bit tokens, frozen
safe payload, expiry, revocation, view counts, noindex.

**Trust & data rights**: audit-history screen, session visibility, data
export (full JSON), account deletion, six-month Financial Progress Review
generator (demonstrated on seed data).

**Screens**: all 18 from the build prompt.

**Quality**: unit/integration/e2e tests per the required list, golden-file
calculation tests, accessibility pass, mobile/tablet layouts, full
documentation set.

## Deferred (documented, not silently dropped)

| Deferred item | Why | Earliest phase |
|---|---|---|
| Bank/brokerage aggregation (Plaid/SimpleFIN; Actual Budget import) | Credential and vendor risk; manual + CSV proves the concept (B2) | post-MVP 1 |
| Partner/second-adult login with roles | Authorization surface needs its own threat-model revision (A3) | post-MVP 1 |
| Monte Carlo / probabilistic Lifetime FFI | Spec explicitly allows conservative simplified model first (A4) | post-MVP 2 |
| LLM-phrased explanations layered over reason codes | Determinism first; templates are already plain English (A6) | post-MVP 2 |
| Wealth Engine ("next dollar" destination) | Vision-framework feature, not in PRD MVP outcomes | post-MVP 2 |
| Future Simulator scenarios (job loss, relocation, windfall…) | Purchase impact is the MVP's only simulation | post-MVP 2 |
| Daily CFO briefing + notifications/email digests | Requires notification infra; dashboard covers the need | post-MVP 2 |
| Subscription/waste detection, avoided-fees tracking | Needs rich transaction history (A5) | post-MVP 2 |
| Trust Ladder stages 3–4 (Confirm/Automate) | Explicit PRD non-goal for first release | far future |
| WebAuthn/passkeys | TOTP satisfies MFA requirement; passkeys next | post-MVP 1 |
| Multi-currency / non-US tax treatment | A7 | far future |
| Native apps / offline PWA data | Responsive web + installable shell only | post-MVP 2 |

## Seed household (demonstration data)

The Hendersons (fictional): two adults (41, 39), two children (9, 6).
Accounts: checking ($6,800, $2,500 operating floor), savings ($28,000,
emergency-designated), his 401(k) ($310,000), her 403(b) ($145,000), Roth IRA
($52,000), taxable brokerage ($68,000, cost basis $51,000), 529 ($22,000),
mortgage ($287,000 @ 5.1%), one credit card (paid monthly, $1,900 statement).
Income: $11,400/mo net combined. Spending baseline: $6,300 essential,
$2,900 lifestyle. Goals: education ($120,000 by 2036, protected), vacation
($6,000 by next summer), retirement (protected). Target work-optional age
**55**. Constitution: 6-month reserve, no revolving debt, ≥15% retirement
contribution, ≥20% savings rate, $2,000 confirmation threshold, balanced
optimization.

Seed includes ~7 months of synthetic balance history and transactions
engineered to demonstrate: Immediate FFI ≈ 5.6 → 6.4 months over the period
(behavior-driven), a market dip-and-recover in the brokerage (market-driven,
attributed as such), two evaluated purchases (one approved, one delayed), one
override with a note, and a generated six-month Progress Review.
