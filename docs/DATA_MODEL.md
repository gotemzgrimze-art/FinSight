# Data Model

Primary tables:

- `user`, `session`, `account`, `verification`, `two_factor`
- `profiles`
- `financial_accounts`
- `income_sources`
- `expenses`
- `debts`
- `financial_goals`
- `transactions`
- `purchase_checks`
- `audit_events`

Money columns are stored as integer minor units plus `currency`.

Every financial table includes `user_id`. Backend access must always scope reads and writes by authenticated `user_id`; object IDs alone are not sufficient authorization.
