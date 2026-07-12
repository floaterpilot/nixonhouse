# FFI Calculation Approach

**Phase 1 planning artifact.** These formulas become `src/domain/ffi/` with
golden-file tests; constants live in a versioned `FfiAssumptionSet`. All
amounts are integer cents; results are presented as **time**, secondarily as
a 0–100 trend score.

## Shared inputs

Every calculation receives an explicit snapshot: latest `AccountBalance` per
account, the active `SpendingBaseline`, active policy versions, the
assumption set, exclusions/overrides, and the as-of date. The snapshot is
persisted with the result (`FfiCalculation.inputSnapshotJson`), so any
historical value can be re-derived exactly.

## 1. Immediate FFI

> Available Emergency Resources ÷ Monthly Essential Spending → **months**

**Available Emergency Resources** = Σ over accounts where
`emergencyDesignated = true` and type is cash-like (`checking`, `savings`,
`money_market`, cash-equivalent `other_asset` such as T-bills):

- checking: `max(0, balance − operatingFloor)`
- savings / money market / designated reserves: full balance

**Never included** (hard guardrails, not configurable): retirement accounts,
home equity, credit limits, unvested compensation, expected bonuses, any
account with `excludedFromPlanning`.

**Monthly Essential Spending** comes from the active baseline
(`essentialMonthlyCents`), which is either user-stated (onboarding) or a
rolling 3–6-month computed figure once transaction data exists, always
user-reviewable.

Presentation: `6.4 months of immediate freedom`, one decimal, capped display
at `24+ months`.

## 2. Accessible FFI

> Adjusted Accessible Assets ÷ Normalized Monthly Lifestyle Spending →
> **months, displayed as years when ≥ 12**

**Adjusted Accessible Assets** = emergency resources (as above, before the
operating-floor rule is re-applied — floor still excluded) **plus** taxable
accessible assets with conservative haircuts:

```
brokerage_adjusted = balance
  × (1 − volatilityHaircut)          # default 0.15
  × (1 − sellingCostPct)             # default 0.01
  − taxOnEmbeddedGains               # gains = max(0, balance − costBasis)
                                     # taxed at capGainsRate, default 0.15
                                     # if costBasis unknown: flat 10% of
                                     # balance as the conservative default
```

Maturing short-term instruments count at face value minus selling cost.
Retirement accounts, home equity, and 529s are **not** accessible assets in
the MVP (spec guardrails; 529s are goal-restricted). Excluded accounts and
protected-goal funding accounts are omitted.

**Normalized Monthly Lifestyle Spending** = `essential + lifestyle` from the
baseline, excluding flagged one-time transactions.

Presentation: `2.3 years of accessible freedom`.

## 3. Lifetime FFI (simplified conservative model — assumption A4)

No Monte Carlo in MVP. Three deterministic real-return scenarios produce a
range; false precision is structurally impossible to display because the
result type *is* a range.

Inputs: investable assets (retirement + brokerage + designated long-term
savings), monthly retirement spending target (default: current lifestyle
spending; user-overridable), current ages, target work-optional age,
expected monthly contributions (from stated savings behavior), assumption
set: real return scenarios (defaults **2% / 4% / 5.5%**), withdrawal
guardrail (default **3.5%** — deliberately below the classic 4%), planning
horizon to age 95, Social Security/pension as user-stated monthly offsets
starting at a stated age (never assumed).

Method per scenario:
1. Project investable assets to target age with monthly compounding at the
   scenario's real rate plus contributions.
2. Required assets at target age =
   `(annual retirement spending − annual guaranteed income offsets) ÷ withdrawalGuardrail`.
3. **Percent funded** = projected ÷ required (base scenario headline,
   low/high stored as the band).
4. **Work-optional age** per scenario = first age where projected ≥ required;
   report the range across scenarios, e.g. `54–58`.

Outputs shown together, always: percent funded, work-optional age range,
confidence level, the assumptions used (expandable), and "what moves this
most" (sensitivity: we recompute with ±10% spending and ±1 year of savings
to rank the levers). Never a single guaranteed date.

## Confidence levels (all three measures)

Deterministic scoring straight from the spec:
- **High**: ≥ 6 months of transaction data, stable income flag, balances
  updated within 35 days, liabilities present, categories reviewed.
- **Medium**: 3–6 months of data, or missing accounts flagged by the user,
  or irregular income.
- **Low**: < 3 months of data, missing income/liability records, or a large
  one-time event inside the baseline window.

Confidence is computed by counting which conditions hold, is always displayed
next to the number it qualifies, and is stored with each calculation.

## Safe-to-spend (assumption A10)

`max(0, netMonthlyIncome − essentialSpending − committedGoalContributions −
upcomingObligationsThisMonth − currentMonthLifestyleSpendToDate)` — never
sourced from emergency reserves; shown on the dashboard with its definition
one tap away.

## Trends and attribution

A scheduled (and on-data-change) recalculation writes `FfiCalculation` rows,
giving us the 30-day / 6-month / 1-year series. Change attribution between
two calculations is computed by **recomputing intermediate counterfactuals**:

- market movement: re-run the older calc with only investment balances
  updated;
- savings/behavior: only cash balances and baseline updated;
- income change: only income updated;
- one-time events: flagged transactions isolated.

Each factor's delta is reported separately, which is what lets the UI honor
"a strong market month must not masquerade as durable progress" — market
deltas are labeled as market, and the long-term view charts the
behavior-driven series prominently.

## Purchase impact

For a `PurchaseRequest`, the engine re-runs Immediate and Accessible FFI on a
snapshot with the purchase applied (cash out of the paying account, or debt
added for credit/financing, recurring cost added to the baseline). **Recovery
time** = purchase amount ÷ current monthly surplus (∞ → "no current
surplus" messaging). Work-optional-age impact re-runs the Lifetime base
scenario with the reduced assets/contributions and reports the age delta in
months, with a floor of "no measurable change" below half a month.

## Versioning

`CALC_VERSION = "ffi-1.0.0"` initially; any formula or default change bumps
it. Stored results keep their version, and the calculation-detail view labels
results computed under older versions.
