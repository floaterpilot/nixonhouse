# The Autonomous CFO
## Product Requirements Document

**Version 0.1 — Initial Responsive Web Application**

## 1. Product Objective

Build a responsive web application for desktop, iPad, and iPhone that helps a household understand its financial position, receive clear recommendations, evaluate purchases, and track progress toward financial freedom.

The first release must prove value within six months.

## 2. Initial User

The initial user is a financially established household that:

- Earns sufficient income but lacks a coherent financial system.
- Feels overwhelmed by financial decisions.
- Wants financial independence rather than speculative wealth.
- Uses multiple accounts, cards, investments, and liabilities.
- Wants recommendations rather than more reporting.
- Is willing to confirm or override recommendations.
- Requires strong privacy, security, and explainability.

## 3. MVP Outcomes

The MVP should allow the user to:

1. Connect or enter a complete financial picture.
2. Define a target work-optional age.
3. Establish a simple Financial Constitution.
4. View Immediate and Accessible FFI.
5. Ask whether a purchase is affordable.
6. Receive a plain-language recommendation.
7. Confirm or override recommendations.
8. View short-term and long-term trends.
9. Review an audit history.
10. Generate a shareable purchase-decision link.

## 4. Initial Onboarding Questions

The product should begin with six primary questions.

### Question 1

At what age do you want paid work to become optional?

### Question 2

What monthly lifestyle do you want the system to protect?

The app may provide a calculated starting estimate from account history.

### Question 3

How much emergency protection makes you feel safe?

Options may include:

- 3 months
- 6 months
- 9 months
- 12 months
- Custom

### Question 4

Which goals must the system protect?

Examples:

- Retirement
- Education
- Travel
- Home
- Vehicle
- Family support
- Giving

### Question 5

How much authority should the system have today?

Options:

- Observe only
- Recommend
- Prepare actions for approval
- Automate within approved limits

The MVP should initially support Observe and Recommend.

### Question 6

What should the system optimize for when goals conflict?

Options may include:

- Earliest financial independence
- Balanced freedom and lifestyle
- Maximum current flexibility
- Debt elimination
- Custom priority order

## 5. Primary Screens

### Dashboard

Shows:

- Immediate FFI
- Accessible FFI
- Lifetime progress
- Work-optional age range
- Financial health summary
- Safe-to-spend amount
- Actions requiring attention
- 30-day and six-month trends

### Can We Afford It?

Inputs:

- Item
- Price
- Purchase date
- Payment method
- Optional recurring cost
- Optional notes

Outputs:

- Recommendation
- Reasoning
- FFI impact
- Goal impact
- Work-optional-date impact
- Better alternatives
- Confirm or override
- Shareable link

### Financial Constitution

Allows the user to:

- Review policies
- Add or revise policies
- Approve recommended changes
- See policy conflicts
- See which recommendations were driven by each policy

### Goals

Shows:

- Goal name
- Target date
- Target amount
- Priority
- Progress
- Funding status
- Conflicts

### Trends

Separates:

- Short-term operational trend
- Long-term wealth trend
- Market-driven changes
- Behavior-driven changes
- Income-driven changes

### Recommendations

Displays:

- Current recommendations
- Expected impact
- Required action
- Expiration date
- Confidence
- Confirm, defer, or override

### Audit History

Displays:

- Recommendations made
- User decisions
- Overrides
- Calculations
- Data changes
- Automation authority changes

### Security and Connections

Displays:

- Connected accounts
- Access level
- Last sync
- Permissions
- Active sessions
- Data export
- Data deletion
- Emergency lock mode

## 6. Recommendation Format

Every recommendation must use the same structure.

### Decision

Approved, Caution, Delay, Not Recommended, or Review Required.

### Why

A plain-language explanation.

### Immediate Impact

Effect over the next 30 to 180 days.

### Long-Term Impact

Effect on work-optional age, goals, and lifetime freedom.

### FFI Impact

Before-and-after values.

### Confidence

High, Medium, or Low.

### Alternatives

One or more practical options.

### Required Action

What the user should do next.

## 7. Short-Term Versus Long-Term Trends

### Short-Term View

Primary horizon: six months.

Measures:

- Monthly surplus
- Spending volatility
- Reserve growth
- Debt reduction
- Recommendation adoption
- Avoided fees
- Canceled waste
- FFI movement

### Long-Term View

Primary horizon: target work-optional age.

Measures:

- Net worth trend
- Investable asset growth
- Savings rate
- Projected work-optional age
- Probability range
- Goal funding
- Lifetime FFI progress

## 8. Trust and Security Requirements

The MVP must:

- Default to read-only financial connections.
- Store the minimum required financial data.
- Encrypt sensitive data.
- Use strong authentication.
- Support multi-factor authentication.
- Provide session management.
- Log all recommendation and authority changes.
- Never store raw banking credentials.
- Never execute transactions in the first release.
- Allow users to disconnect accounts.
- Allow users to export and delete their data.
- Clearly separate fact, assumption, and recommendation.
- Display confidence for uncertain results.

## 9. Decision Authority Model

### Observe

The app produces retrospective insights and hypothetical recommendations.

### Recommend

The app produces live recommendations but does not initiate actions.

### Confirm

Future phase. The app prepares an action for explicit user confirmation.

### Automate

Future phase. The app executes within policy limits.

The user controls authority independently by action type.

## 10. Six-Month Review

The application should automatically generate a six-month report that answers:

- Are finances more stable?
- Has FFI improved?
- Which recommendations created value?
- Which recommendations were ignored?
- Which overrides were beneficial?
- What changed due to markets versus behavior?
- Is the user still on track for age 55?
- What should change over the next six months?

## 11. Non-Goals for the MVP

The first release should not:

- Trade securities.
- Move money.
- Provide tax filing.
- Sell financial products.
- Replace licensed legal, tax, or investment professionals.
- Use complex investment strategies.
- Attempt autonomous financial execution.
- Support every financial institution.
- Produce false precision.

## 12. Definition of MVP Success

The MVP is successful when the user can say:

- I know whether we are okay.
- I know what to do next.
- I can answer whether we can afford something.
- I understand the effect of my decisions.
- I can see six months of measurable progress.
- I trust the system's reasoning.
- I am closer to work becoming optional.
