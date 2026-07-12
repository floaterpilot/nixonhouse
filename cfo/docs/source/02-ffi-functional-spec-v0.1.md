# Financial Freedom Index
## Functional Specification

**Version 0.1**

## Purpose

The Financial Freedom Index translates a household's financial position into a measure of time.

It answers:

> If earned income stopped today, how long could the household continue its current lifestyle?

The FFI must be understandable in seconds, defensible under review, and useful across weeks, months, years, and decades.

## Design Principles

1. The result must be explainable.
2. The result must distinguish liquid safety from long-term independence.
3. The result must not imply false precision.
4. The result must show assumptions.
5. The result must include a confidence range.
6. The result must never encourage unsafe withdrawals or excessive risk.
7. The calculation should become more accurate as more data is observed.

## Three FFI Measures

### 1. Immediate FFI

Measures how long the household can cover essential spending using cash and cash-equivalent reserves.

Formula:

Immediate FFI = Available Emergency Resources / Monthly Essential Spending

Included resources may include:

- Checking cash above required operating balance
- Savings
- Money-market funds
- Treasury bills intended as reserves
- Other designated emergency assets

Excluded resources include:

- Retirement accounts with penalties
- Home equity
- Credit-card limits
- Unvested compensation
- Expected bonuses
- Assets that cannot be readily accessed

### 2. Accessible FFI

Measures how long the household can maintain its current lifestyle using reasonably accessible financial assets.

Formula:

Accessible FFI = Accessible Assets / Normalized Monthly Spending

This may include:

- Cash reserves
- Taxable brokerage assets
- Maturing short-term investments
- Other liquid non-retirement assets

The system should apply conservative adjustments for taxes, market volatility, and selling costs.

### 3. Lifetime FFI

Measures whether investable assets can support ongoing spending for the user's expected lifetime.

The system should use scenario modeling rather than a single guaranteed withdrawal rate.

Inputs include:

- Investable assets
- Expected spending
- Inflation
- Taxes
- Social Security or pensions
- Retirement account access
- Market-return assumptions
- Age
- Life expectancy range
- Goal obligations
- Risk tolerance

Output examples:

- 42% funded
- Estimated work-optional age: 54–57
- 82% probability of sustaining planned spending
- Projected lifetime FFI: not yet achieved

## Spending Definitions

The user should see at least two spending bases.

### Essential Spending

Expenses required to maintain safety and basic household operation.

Examples:

- Housing
- Utilities
- Basic food
- Insurance
- Healthcare
- Minimum debt payments
- Essential transportation
- Required family obligations

### Current Lifestyle Spending

The household's normalized total spending, excluding unusual one-time expenses where appropriate.

The system should calculate a rolling baseline and allow the user to review reclassifications.

## Trend Horizons

### Short-Term Trend

Covers the previous 30 to 180 days.

Used to show:

- Cash-flow improvement
- Reserve growth
- Debt reduction
- Spending stabilization
- Subscription savings
- Progress since onboarding

### Long-Term Trend

Covers one year through the user's planning horizon.

Used to show:

- FFI trajectory
- Estimated work-optional age
- Savings-rate sustainability
- Investment growth
- Goal conflicts
- Long-term plan confidence

The interface must not allow a strong market month to masquerade as durable progress.

## Six-Month Proof

At the end of six months, the application should produce a Financial Progress Review.

It includes:

- Starting Immediate FFI
- Current Immediate FFI
- Starting Accessible FFI
- Current Accessible FFI
- Change in normalized spending
- Change in savings rate
- Debt reduced
- New reserves created
- Investment contributions
- Decisions followed
- Decisions overridden
- Estimated cumulative impact
- Updated long-term projection

The review should distinguish:

- Results caused by user behavior
- Results caused by market movement
- Results caused by income changes
- Results caused by one-time events
- Results caused by application recommendations

## FFI Score Presentation

The primary display should use time, not an abstract score.

Examples:

- 4.2 months of immediate freedom
- 2.1 years of accessible freedom
- 61% toward lifetime freedom

A secondary 0–100 score may be used for trend visualization, but it must not replace the underlying time-based measure.

## Purchase Decision Integration

Every purchase decision should show:

- Immediate FFI before purchase
- Immediate FFI after purchase
- Accessible FFI before purchase
- Accessible FFI after purchase
- Change in work-optional date
- Recovery time
- Recommendation

Example:

> This purchase reduces immediate freedom from 7.1 months to 6.8 months. Your six-month reserve remains protected. The estimated work-optional date is unchanged. Recommendation: Approved.

## Confidence Levels

The system assigns confidence based on data completeness and stability.

### High Confidence

- At least six months of complete transaction data
- Stable recurring income
- Accounts reconciled
- Major liabilities known
- Spending categories reviewed

### Medium Confidence

- Three to six months of data
- Some missing accounts
- Irregular spending patterns
- Incomplete goal information

### Low Confidence

- Less than three months of data
- Missing income or liability data
- Major uncategorized transactions
- Significant one-time events

The user must always see the current confidence level.

## Guardrails

The FFI must not:

- Count available credit as wealth.
- Treat home equity as liquid freedom unless a realistic access plan is defined.
- Assume bonuses or future raises.
- Use investment returns as guaranteed.
- Hide taxes or penalties.
- recommend depletion of protected reserves.
- Present a single projection without a range.
- confuse temporary underspending with a sustainable lifestyle reduction.

## Required Data

Minimum inputs:

- Household members
- Current age
- Target work-optional age
- Cash balances
- Investment balances
- Debt balances and rates
- Monthly income
- Essential monthly spending
- Current lifestyle spending
- Retirement income assumptions
- Major goals
- Emergency reserve policy

## User Overrides

The user may override:

- Essential expense classification
- Protected account designation
- Retirement spending target
- Risk assumptions
- Goal priority
- Expected pension or Social Security income
- Assets excluded from planning

Every override must be logged and visible.

## Auditability

Each FFI result must retain:

- Calculation date
- Source balances
- Spending baseline
- Assumptions
- Exclusions
- Confidence level
- Model version
- User overrides

The user should be able to select any historical FFI value and see how it was calculated.

## Initial Release Scope

The first release should support:

- Immediate FFI
- Accessible FFI
- Manual spending classification review
- 30-day trend
- Six-month trend
- Purchase impact
- Work-optional target projection
- Confidence indicator
- Calculation details

Lifetime FFI probability modeling may begin with a conservative simplified model and become more sophisticated later.
