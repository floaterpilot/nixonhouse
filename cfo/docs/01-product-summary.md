# The Autonomous CFO — Product Summary and Assumptions

**Phase 1 planning artifact. No application code exists yet.**

## What we are building

A responsive web application (desktop, iPad, iPhone) that acts as a household's
personal CFO. It is **read-only and advisory** in its first release: it never
moves money, trades, or changes account settings.

The user can:

1. Create a household financial profile (members, accounts, balances, income,
   spending, debt, investments, goals).
2. Define a target age at which paid work becomes optional.
3. Establish a Financial Constitution — explicit written policies the system
   must respect (reserve targets, debt limits, savings-rate minimums,
   confirmation thresholds, protected goals).
4. See the Financial Freedom Index (FFI) expressed as **time**:
   - **Immediate FFI** — months of essential spending covered by emergency
     resources.
   - **Accessible FFI** — years of lifestyle spending covered by reasonably
     accessible assets, after conservative haircuts.
   - **Lifetime FFI** — a conservative planning estimate of progress toward
     work being optional (percent funded, work-optional age *range*,
     confidence level — never a guaranteed date).
5. Ask **"Can we afford it?"** for a specific purchase and receive a
   deterministic, explainable recommendation with before/after FFI, goal
   impact, work-optional-age impact, recovery time, and practical
   alternatives.
6. Confirm, defer, or override every recommendation.
7. Review a complete audit history of recommendations, decisions, policy
   changes, calculations, and security events.
8. View short-term (30 days–6 months) and long-term (1 year–target age)
   trends, with market-driven and behavior-driven changes kept separate.
9. Generate a private, revocable, expiring shareable page for a purchase
   decision that exposes no account names, balances, or household details.

## Priority order when requirements conflict

1. Security and user trust
2. FFI Functional Specification
3. Product Requirements Document
4. Vision Framework
5. Implementation convenience

## Guardrails carried directly from the FFI spec

The FFI must never: count available credit as wealth; treat home equity as
liquid freedom without a defined access plan; assume bonuses or raises; treat
investment returns as guaranteed; hide taxes or penalties; recommend depleting
protected reserves; present a single projection without a range; or confuse
temporary underspending with a sustainable lifestyle reduction.

## Ambiguities identified and assumptions made

These are documented per the build prompt's instruction not to silently ignore
or silently resolve requirements. Each also appears in the decision log.

| # | Ambiguity | Assumption for MVP |
|---|-----------|--------------------|
| A1 | The repo already hosts an unrelated homelab dashboard (React/Vite + Express, JWT, no database) with its own `/finance` module backed by Actual Budget. | The CFO is built as a **self-contained application in `cfo/`** with its own stack, database, and auth. It shares nothing with the dashboard except the repo and (optionally, at deploy time) the Cloudflare Tunnel, e.g. served at `cfo.nixonhouse.com`. Rationale in the architecture doc. |
| B2 | "Connect or import" accounts — bank aggregation (Plaid etc.) is heavy, has credential implications, and the prompt forbids storing institution credentials. | MVP is **manual entry + CSV transaction import**. Bank connections are deferred. The existing Actual Budget instance is a candidate future import source, also deferred. |
| A3 | Households have two adults, but multi-login household access control is a large security surface (the threat model lists "unauthorized household access"). | MVP: **one login account owns the household**; other members exist as profile records without logins. Partner sign-in with roles is deferred and designed for in the data model (HouseholdMember ↔ User is optional). |
| A4 | Lifetime FFI: the spec allows "a conservative simplified model" for the first release. | Deterministic three-scenario real-return projection (conservative / base / optimistic) producing a percent-funded figure and a work-optional **age range**. No Monte Carlo in MVP. |
| A5 | "Avoided fees or waste" and "canceled waste" trend metrics require rich transaction history. | Shown only when transaction data exists to support them; otherwise the tile states that more data is needed. Subscription-waste detection is deferred. |
| A6 | AI plain-language explanations are permitted but the decision must be deterministic. | MVP explanations are generated from **deterministic reason-code templates** — reproducible and testable. An optional LLM re-phrasing layer is deferred. |
| A7 | Currency and jurisdiction. | USD only, US-centric tax haircut defaults (documented and configurable). Multi-currency deferred. |
| A8 | Password-reset email requires an outbound mail provider. | SMTP settings via environment variables; in local/dev mode reset links print to the server log. Documented in setup guide. |
| A9 | Six-month Financial Progress Review requires six months of real usage. | The report generator ships in the MVP and is demonstrated against seed data with six months of synthetic history. |
| A10 | "Safe-to-spend amount" on the dashboard is named but not specified. | Defined as: current-month surplus (income − essential − committed goal contributions − known upcoming obligations), floored at zero, never dipping into emergency reserves. Formula documented in the FFI calculation doc. |

## Explicit non-goals (first release)

- No money movement, trading, or transaction execution of any kind.
- No tax filing, product sales, or affiliate anything.
- No autonomous authority beyond **Observe** and **Recommend** (Trust Ladder
  stages 1–2).
- No bank credential storage, ever.
- No false precision: every projection carries a range and a confidence level.
