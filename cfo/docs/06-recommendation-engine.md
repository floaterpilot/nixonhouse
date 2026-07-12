# Recommendation Engine

**Phase 1 planning artifact.** Deterministic, rules-based, fully explainable.
No AI in the decision path. Engine version stored on every recommendation.

## Shape

```
evaluate(snapshot, constitution, goals, purchase, assumptions, clock)
  → { decision, reasonCodes[], impacts, ffiBeforeAfter, confidence,
      alternatives[], requiredAction }
```

Pure function in `src/domain/recommend/`. Rules run in a fixed order; each
rule returns `pass`, or a finding with a **reason code** and a severity. The
worst severity determines the decision:

| Severity found | Decision |
|----------------|----------|
| `blocker` | **Not Recommended** |
| `needs_user` | **Review Required** |
| `defer` | **Delay** |
| `caution` | **Approved with caution** |
| none | **Approved** |

## Rule pipeline (MVP set)

Ordered; all rules always run so the explanation is complete even when an
early rule already decided the outcome.

**R1 — data sufficiency** (`needs_user`): missing essential baseline, no
balances, or amount ≥ 25% of accessible assets with Low confidence →
Review Required.

**R2 — constitution: confirmation threshold** (`needs_user`): amount ≥
`purchase_confirmation_threshold_cents` → Review Required (never silently
approved above the user's own line).

**R3 — hard reserve floor** (`blocker`): post-purchase Immediate FFI <
`emergency_reserve_months` policy → Not Recommended. This rule is
guardrail-backed: no configuration can make the engine recommend depleting
protected reserves.

**R4 — reserve pressure** (`defer`/`caution`): post-purchase Immediate FFI
within 0.5 months of the floor → Delay; within 1.0 month → Caution.

**R5 — constitution: revolving debt** (`blocker`): payment method
`credit_card` and projected statement balance would exceed
`max_revolving_debt_cents` (default 0 if the user adopted the no-revolving
policy) → Not Recommended; suggest cash/savings alternative.

**R6 — cash-flow coverage** (`defer`/`caution`): one-time amount >
3 × monthly surplus → Delay with a computed save-up date; > 1 × surplus →
Caution. Recurring purchases: new recurring cost pushing savings rate below
`min_savings_rate_pct` → Delay (`blocker` if it also breaks R3 over 12
months).

**R7 — protected goals** (`blocker` / `caution`): payment source is a
protected goal's funding account → Not Recommended; purchase delaying a
protected goal's funding past its target date → Caution with the delay
quantified.

**R8 — upcoming obligations** (`caution`/`defer`): known obligations within
90 days would collide with the purchase in the same account → Delay until
after the obligation clears.

**R9 — work-optional impact** (`caution`): Lifetime base-scenario
work-optional age worsens by > 3 months → Caution (> 12 months → Delay).
Small impacts are reported as facts, not warnings — the engine does not
guilt-trip discretionary spending that the plan can absorb (UX requirement:
no guilt-based messaging).

**R10 — optimization strategy tiebreak**: when the strategy policy is
`debt_elimination` or `earliest_independence`, borderline `caution` findings
on discretionary purchases escalate to `defer`; under
`maximum_current_flexibility` they do not. Documented per strategy.

## Explanations (assumption A6)

Every reason code maps to a plain-English template with typed slots, e.g.

> `R4_RESERVE_PRESSURE`: "This purchase leaves {monthsAfter} months of
> emergency reserves — above your {floorMonths}-month floor, but with less
> cushion than usual. Your reserves would recover by {recoveryDate}."

Templates are versioned with the engine, unit-tested, and never interpolate
user text into markup. The full explanation is the ordered concatenation of
triggered findings plus the strongest positive facts ("your six-month reserve
remains protected"). Fact, assumption, and recommendation are visually
separated in the UI.

## Alternatives (deterministic generators)

Run after the decision, each producing a concrete option only when it changes
the outcome:

1. **Wait until {date}** — earliest date the purchase passes all rules,
   found by re-running the engine against projected balances (surplus
   accumulation model).
2. **Reduce to {amount}** — binary-search the largest amount that yields
   Approved.
3. **Pay from {other source}** — re-run with each eligible non-protected
   funding source.
4. **Save {monthly} for {n} months** — dedicated sinking fund reaching the
   amount without touching reserves.
5. **Buy without changing the plan** — shown when the purchase is Approved
   and absorbs entirely into current surplus.

## Confidence

`min(FFI confidence of the inputs, data-recency score)` — High/Medium/Low,
with the limiting factor named ("Medium — balances last updated 6 weeks
ago").

## Required action

One imperative sentence derived from the decision + top finding: "Buy it —
no plan changes needed." / "Wait until March 14, after the insurance payment
clears." / "Confirm below — this is above your $2,000 confirmation
threshold."

## Auditability and testing

- Recommendation rows store: engine version, reason codes, policy version
  ids, FFI calculation ids, and the full rendered output.
- Golden tests: documented sample households × purchase matrix with expected
  decisions and reason codes (the build prompt's "documented sample inputs
  and expected outputs").
- Property tests: e.g. increasing purchase amount never improves the
  decision; no input can produce a recommendation that violates R3.
