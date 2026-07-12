# Data Model

**Phase 1 planning artifact.** Field lists show intent, not final DDL; the
Prisma schema in Phase 2 is the source of truth from then on.

Conventions: all money in **integer cents**; all tables have `id` (cuid),
`createdAt`, `updatedAt`; soft context via `householdId` on every
household-scoped table; anything a historical calculation depends on is
**versioned, never edited in place**.

## Identity and security

**User** — email (unique), passwordHash (managed by better-auth), name,
emailVerifiedAt, twoFactorEnabled, failedLoginCount/lockedUntil (lockout),
emergencyLockedAt (emergency lock mode: blocks everything except unlock).

**SecuritySession** — userId, sessionToken (hashed), createdAt, lastSeenAt,
expiresAt, ip (truncated), userAgent, revokedAt. Listable and individually
revocable from the Security screen.

**Household** — name, currency (`USD`), createdByUserId.

**HouseholdMember** — householdId, name, birthYear, role (`adult`|`child`),
userId (nullable — only the owner has one in MVP; enables partner logins
later without remodeling).

## Financial position

**Account** — householdId, name, institutionName (display only — never
credentials), type (`checking`|`savings`|`money_market`|`brokerage`|
`retirement_401k`|`retirement_ira`|`hsa`|`529`|`mortgage`|`credit_card`|
`loan`|`other_asset`|`other_liability`), liquidity tier (derived from type,
overridable), emergencyDesignated (bool), operatingFloorCents (checking only:
balance below this never counts as emergency resource), excludedFromPlanning
(bool, a user override — logged), interestRateBps (liabilities),
minimumPaymentCents (liabilities), costBasisCents (taxable brokerage, for the
tax haircut), closedAt.

**AccountBalance** — accountId, balanceCents, asOf, source
(`manual`|`import`), enteredByUserId. Append-only; “current balance” = latest
row. This history is what powers trends and market-vs-behavior attribution.

**IncomeSource** — householdId, name, ownerMemberId, grossMonthlyCents,
netMonthlyCents, stability (`stable`|`variable`|`ending`), endsAt (nullable).

**Transaction** — householdId, accountId (nullable), date, amountCents,
description, categoryId, isRecurring (bool), oneTimeFlag (bool — excluded
from normalized baseline), importId (nullable). Optional in MVP (manual/CSV);
richer data raises confidence.

**SpendingCategory** — householdId, name, classification
(`essential`|`lifestyle`), userReclassifiedAt (override tracking).

**SpendingBaseline** — householdId, effectiveFrom, essentialMonthlyCents,
lifestyleMonthlyCents, method (`user_stated`|`computed_rolling`), inputsNote.
Append-only; FFI calculations reference the row they used.

**UpcomingObligation** — householdId, name, amountCents, dueDate, recurring
(bool). Feeds “known upcoming obligations” in affordability checks.

**Goal** — householdId, name, kind (`retirement`|`education`|`travel`|`home`|
`vehicle`|`family`|`giving`|`custom`), targetAmountCents, targetDate,
priority (int), flexibility (`fixed`|`flexible`), protected (bool — protected
goals cannot be raided by recommendations), fundedCents (derived from linked
account or manual), fundingAccountId (nullable).

**DataImport** — householdId, kind (`csv_transactions`), filename, rowCount,
importedAt, status, errorNote. (Raw files are not retained after processing.)

## Constitution and policies

**FinancialConstitution** — householdId, activatedAt. One active per
household.

**FinancialPolicy** — constitutionId, type (`emergency_reserve_months`|
`max_revolving_debt_cents`|`min_retirement_contribution_pct`|
`min_savings_rate_pct`|`target_work_optional_age`|
`purchase_confirmation_threshold_cents`|`protected_goal`|
`optimization_strategy`|`excluded_account`), valueJson, version (int),
supersededById (nullable), createdByUserId, reasonNote. **Append-only
versioning**: changing a policy writes a new row and links the old one; every
change is audited. Recommendations record which policy versions they
evaluated against.

## FFI

**FfiCalculation** — householdId, kind (`immediate`|`accessible`|`lifetime`),
calculatedAt, resultNumeric (months / months / percentFunded), resultLowBand /
resultHighBand (lifetime), workOptionalAgeLow/High (lifetime), confidence
(`high`|`medium`|`low`), calcVersion, **inputSnapshotJson** (balances,
baseline id, policy versions, exclusions used), **assumptionSetId**, trigger
(`scheduled`|`data_change`|`purchase_check`|`manual`). Selecting any
historical value shows exactly how it was computed.

**FfiAssumptionSet** — versioned bundle of assumption values: brokerage
volatility haircut, tax haircut defaults, selling-cost pct, real-return
scenario rates, inflation, withdrawal guardrail, life-expectancy planning age.
Defaults are system-versioned; user overrides create a household-scoped set
and are logged.

## Decisions

**PurchaseRequest** — householdId, name, amountCents, plannedDate,
paymentMethod (`cash`|`account:<id>`|`credit_card`|`financing`), recurring
(bool), recurringMonthlyCents, category, notes, status
(`evaluated`|`confirmed`|`deferred`|`overridden`|`expired`).

**Recommendation** — purchaseRequestId (nullable — standing recommendations
allowed), householdId, decision (`approved`|`approved_with_caution`|`delay`|
`not_recommended`|`review_required`), reasonCodes (string[]), explanation
(rendered plain-English text), immediateImpactJson, longTermImpactJson,
ffiBeforeAfterJson (immediate + accessible before/after, work-optional-age
delta, recovery months), confidence, alternativesJson, requiredAction,
expiresAt, engineVersion, policyVersionIds (string[]),
ffiCalculationIds (string[]).

**RecommendationDecision** — recommendationId, userId, action
(`confirm`|`defer`|`override`), note, decidedAt. Overrides also write:

**UserOverride** — householdId, scope (`recommendation`|`classification`|
`assumption`|`protected_account`|`goal_priority`), targetId, previousValueJson,
newValueJson, reason, userId. Every override is logged and visible.

## Sharing

**SharedPurchaseLink** — purchaseRequestId, tokenHash (SHA-256 of a 256-bit
random token; raw token shown once, never stored), **payloadJson** (the
denormalized safe subset: item, price, decision, reason, FFI *deltas* as
relative statements, goal-impact summary, suggested date, decision status —
no balances, no account names, no member names), createdByUserId, expiresAt,
revokedAt, viewCount, lastViewedAt.

## Audit

**AuditEvent** — householdId (nullable for pre-auth events), userId
(nullable), type (`recommendation.created`|`recommendation.changed`|
`decision.confirmed`|`decision.overridden`|`policy.changed`|
`balance.changed`|`baseline.changed`|`ffi.calculated`|`assumption.changed`|
`share.created`|`share.revoked`|`auth.login`|`auth.login_failed`|
`auth.session_revoked`|`security.setting_changed`|`data.exported`|
`data.deletion_requested`|`emergency_lock.enabled`|…), payloadJson
(sanitized — no secrets, no full account numbers), ip (truncated), at.
**Append-only**: the app role has INSERT/SELECT but no UPDATE/DELETE on this
table, enforced by DB grants.

## Entity coverage check vs. build prompt

User ✓, Household ✓, Household member ✓, Account ✓, Account balance ✓,
Asset ✓ (Account types), Liability ✓ (Account types), Income source ✓,
Transaction ✓, Spending category ✓, Spending baseline ✓, Goal ✓, Financial
Constitution ✓, Financial policy ✓, Recommendation ✓, Recommendation
decision ✓, User override ✓, FFI calculation ✓, FFI assumption ✓, Purchase
request ✓, Shared purchase link ✓, Audit event ✓, Security session ✓,
Data import ✓.
