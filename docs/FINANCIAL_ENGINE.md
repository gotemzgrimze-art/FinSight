# Financial Engine

The purchase decision layer is deterministic and testable. It does not use an LLM to decide affordability.

Inputs:

- Liquid accounts
- Income sources
- Expenses
- Debt payments and APR
- Goals and contribution rates
- Emergency-fund target
- Proposed purchase

Outputs:

- Impact level: `LOW_IMPACT`, `MODERATE_IMPACT`, `HIGH_IMPACT`, `VERY_HIGH_IMPACT`
- Reason codes
- Main explanatory factors
- Alternatives
- Cash-flow projections
- Audit payload with engine version and timestamp

Money is represented with integer minor units and a currency code. Formatting uses `Intl.NumberFormat`.

Reason codes include:

- `EMERGENCY_RUNWAY_LOW`
- `HIGH_PERCENT_LIQUID_CASH`
- `HIGH_PERCENT_DISCRETIONARY`
- `UPCOMING_BILLS_HIGH`
- `HIGH_INTEREST_DEBT`
- `GOAL_DELAY`
- `INCOME_VOLATILITY`
- `NEGATIVE_CASH_AFTER_PURCHASE`
- `EMERGENCY_TARGET_BREACHED`
