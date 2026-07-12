# Product Decision Log

Running log of decisions with material consequences. Newest at the bottom.
Each entry: decision, alternatives considered, rationale, and who decided.

| # | Date | Decision | Alternatives | Rationale | Decided by |
|---|------|----------|--------------|-----------|------------|
| D1 | 2026-07-12 | Build the CFO as a standalone app in `cfo/` with its own stack, DB, and auth; deploy on its own subdomain via the existing tunnel. | Extend the existing dashboard's Express/React stack. | Security requirements (MFA, revocable DB sessions, audit, encryption) exceed the dashboard's design; isolation protects both apps. | Proposed by engineering — **pending owner review** |
| D2 | 2026-07-12 | Next.js App Router as a single deployable (no separate API service). | Separate API layer. | Prompt allows either; separation adds operational cost with no MVP benefit. Domain logic is isolated in `src/domain/` so a later split is cheap. | Proposed — pending review |
| D3 | 2026-07-12 | better-auth with DB sessions, scrypt, TOTP plugin. | Auth.js/NextAuth, Lucia, hosted auth (Clerk/Auth0). | Meets every stated auth requirement including true session revocation; self-hosted (no financial metadata sent to a third party); no custom crypto. | Proposed — pending review |
| D4 | 2026-07-12 | Money stored as integer cents. | Decimal columns, floats. | Exact arithmetic; floats forbidden for money. | Engineering |
| D5 | 2026-07-12 | Manual entry + CSV import only in MVP; no bank aggregation. | Plaid/SimpleFIN now. | Prompt forbids storing institution credentials; aggregation is the top post-MVP item. | Per prompt scope |
| D6 | 2026-07-12 | One login per household in MVP; members are records. | Partner logins now. | Shrinks the authorization threat surface for v1; schema already supports adding it. | Proposed — pending review |
| D7 | 2026-07-12 | Lifetime FFI = three deterministic real-return scenarios (2%/4%/5.5%) + 3.5% withdrawal guardrail → percent funded + age range. | Monte Carlo. | FFI spec allows a conservative simplified model first; ranges prevent false precision. | Per FFI spec §Initial Release Scope |
| D8 | 2026-07-12 | Recommendation explanations from deterministic reason-code templates; no LLM in MVP. | LLM-phrased explanations. | Reproducibility and testability; prompt requires the decision be deterministic either way. | Per prompt |
| D9 | 2026-07-12 | Share links: 256-bit token stored hashed; page renders a frozen denormalized payload. | Live queries scoped by token. | A share-page bug can never over-expose data that isn't in the payload. | Engineering |
| D10 | 2026-07-12 | Append-only versioning for policies, balances, baselines, calculations; audit table INSERT-only at the DB-grant level. | Mutable rows + audit triggers. | Historical recommendations must remain explainable against the exact data they saw. | Per prompt auditability requirements |
| D11 | 2026-07-12 | USD only; US-centric configurable tax haircuts. | Multi-currency. | Initial user is a US household; complexity deferred. | Proposed — pending review |
| D12 | 2026-07-12 | Field-level AES-256-GCM encryption for sensitive text; numeric balances unencrypted at column level (documented residual risk). | Full column encryption of balances. | Balance columns must aggregate in SQL for trends; host-disk encryption + least privilege covers the residual. | Proposed — pending review |
