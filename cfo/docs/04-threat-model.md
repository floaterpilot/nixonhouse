# Threat Model

**Phase 1 planning artifact — written before implementation, per the build
prompt. Reviewed again in Phase 7 hardening.**

Scope: the `cfo/` application only. The MVP is read-only/advisory and stores
no financial-institution credentials, which removes entire threat classes
(no money-movement fraud, no credential vault to steal). What remains is
still highly sensitive: a complete picture of a household's finances.

Assets to protect, in order: (1) household financial data, (2) account
integrity (who can log in), (3) recommendation integrity (users act on these),
(4) audit-trail integrity.

## Threats and mitigations

### T1. Account takeover
Credential stuffing, phishing, brute force.
- scrypt password hashing via better-auth; no custom crypto.
- TOTP two-factor authentication offered at security setup, strongly
  encouraged for all users.
- Progressive delays then temporary lockout after repeated failed logins
  (`failedLoginCount`/`lockedUntil`); lockouts and failures audited.
- Rate limiting on auth endpoints (per-IP and per-account).
- Password reset tokens: single-use, short-lived, hashed at rest; reset does
  not reveal whether an email exists.
- Session invalidation on password change. Emergency lock mode freezes the
  account entirely until unlocked via re-authentication + second factor.

### T2. Unauthorized household access
Someone with a valid login reading another household's data (IDOR).
- Every query in `server/` is scoped by the session's household id; no route
  accepts a household id from the client.
- MVP has exactly one login per household (documented assumption A3), which
  keeps the authorization model trivially auditable. Partner access, when
  added, gets its own threat-model revision.
- Integration tests assert cross-household reads fail (permission
  enforcement is on the required test list).

### T3. Session theft
- Session tokens are random 256-bit values, stored **hashed** server-side,
  delivered only in `Secure; HttpOnly; SameSite=Lax` cookies.
- Sessions are database-backed: the Security screen lists active sessions
  (device, truncated IP, last seen) and revokes any of them instantly.
- Absolute and idle expiries; rotation on privilege-relevant changes.

### T4. Cross-site request forgery
- SameSite=Lax cookies plus origin verification on all mutating requests
  (better-auth built-in + Next.js server-action origin checks).
- No state change via GET, anywhere — including share-link revocation.

### T5. Injection attacks
- Prisma parameterized queries only; raw SQL forbidden by convention and
  lint rule.
- Zod validation on every input boundary: forms, route handlers, and the CSV
  importer (which also enforces size limits, parses with a real CSV parser,
  and treats all fields as data — no formula evaluation).

### T6. Cross-site scripting
- React's default encoding; `dangerouslySetInnerHTML` banned by lint rule.
- Recommendation explanations are built from **our own templates**, never
  from user text interpolated into markup; user-supplied notes render as
  plain text.
- CSP: `default-src 'self'`, no inline script; plus `X-Content-Type-Options`,
  `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`, HSTS at the edge.

### T7. Malicious or leaked shared links
- 256-bit random token, stored hashed — a database leak does not leak usable
  links.
- The page renders a **frozen, denormalized safe payload** (no live joins
  into household data), so a bug in the share page cannot over-expose.
- User-set expiry, one-click revocation, view counting visible to the owner,
  `noindex` headers, and rate limiting to blunt token scanning (which is
  already computationally infeasible at 256 bits).

### T8. Database compromise
- Least-privilege runtime role: DML on app tables only; INSERT/SELECT-only on
  `AuditEvent`; migrations run under a separate role.
- Sensitive free-text fields (notes, institution display names) encrypted at
  the application layer with AES-256-GCM under `FIELD_ENCRYPTION_KEY`, so a
  raw DB copy is not immediately readable. Balances are stored as numbers to
  keep aggregate queries workable — accepted and documented residual risk.
- No full account numbers are collected at all (nickname + institution
  display name only), so there are none to steal.

### T9. Backup compromise
- `pg_dump` output encrypted (age/GPG) before leaving the host; keys held
  outside the backup volume; restore drill in Phase 7.

### T10. Insider / operator access
- Single-operator self-hosted deployment initially; the honest mitigation is
  transparency: audit trail of admin-level actions, encrypted sensitive
  fields, and documentation of what the operator can technically see.

### T11. Sensitive data in logs
- Central logger with a redaction layer; requests log method/route/status
  only. No request bodies, no tokens, no balances in logs. Audit payloads are
  sanitized at write time. A test asserts known-sensitive fields never appear
  in log output.

### T12. Misleading financial recommendations (product-integrity threat)
- Deterministic, versioned rules engine — same inputs, same output, forever
  reproducible from the stored snapshot.
- Guardrails from the FFI spec are hard-coded as non-overridable rules (never
  count credit as wealth, never recommend raiding protected reserves, always
  show ranges and confidence).
- Golden-file tests on documented sample households pin expected outputs;
  any formula change requires bumping `CALC_VERSION` and updating goldens in
  the same reviewed commit.

### T13. Manipulation of recommendation inputs
- All inputs are user-owned data changed only through authenticated,
  validated, audited writes; balance and baseline changes are append-only, so
  an attacker (or confused user) cannot silently rewrite the history a
  recommendation was based on.
- Constitution changes never happen implicitly — the engine may *propose*,
  only the user applies, and every version is retained.

### T14. Dependency and supply-chain risk
- Lockfiles committed; `npm audit` + Dependabot in CI; minimal dependency
  surface (no packages for things a few lines of stdlib can do).

## Accepted residual risks (documented, revisited in Phase 7)

1. Numeric balances unencrypted at the column level (needed for queries);
   mitigated by disk encryption at the host and least-privilege roles.
2. Self-hosted single-operator model concentrates trust in the operator.
3. No WebAuthn/passkeys in MVP (TOTP only); planned follow-up.
4. Email-based password reset inherits the security of the user's mailbox —
   mitigated by 2FA, which reset does not bypass.
