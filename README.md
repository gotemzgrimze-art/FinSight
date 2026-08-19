# FinSight

FinSight is a SvelteKit financial decision-support application. It calculates and explains the likely impact of a purchase using cash, income, expenses, debt, goals, emergency reserves, transactions, and cash-flow forecasts.

FinSight provides educational planning tools, not financial advice. It is not a bank and does not move money.

## Stack

- SvelteKit 2, Svelte 5, TypeScript, Vite
- Better Auth for email/password auth, email verification, password reset, secure sessions, admin role foundation, and MFA architecture
- Drizzle ORM with PostgreSQL schema and migrations
- Vitest for domain/security validation tests
- Integer minor-unit money representation
- SvelteKit Node adapter for backend-capable production builds

## Local Setup

```sh
pnpm install
cp .env.example .env
pnpm run db:migrate
pnpm run dev
```

Without `DATABASE_URL`, the app can build and display clearly labeled synthetic demo financial data, but onboarding and persistent financial storage are disabled.

## Environment Variables

See `.env.example`.

Required before production:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- Real transactional email provider configuration

## Routes

- Public: `/`, `/signup`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`
- Authenticated: `/dashboard`, `/onboarding`, `/cash-flow`, `/transactions`, `/purchase-check`, `/bank/connect`
- Settings: `/settings`, `/settings/security`, `/settings/privacy`

## Database

The schema lives in `src/lib/server/db/schema.ts`; migration SQL lives in `drizzle/0000_initial_finsight_platform.sql`.

Financial records are keyed by `user_id` and repository queries are scoped to the authenticated user. Tables include auth tables plus profiles, financial accounts, income sources, expenses, debts, goals, transactions, purchase checks, and audit events.

## Financial Engine

New deterministic engine code lives in:

- `src/lib/money.ts`
- `src/lib/finance/cashFlow.ts`
- `src/lib/finance/purchaseEngine.ts`

Money is stored as integer minor units, for example `$1,499.99` is `{ amountMinor: 149999, currency: "USD" }`.

## Bank Integrations

Bank connection code uses a `BankDataProvider` interface in `src/lib/server/bank/providers.ts`. The current provider is mock-only, read-only, and clearly labeled. Do not treat it as a real bank connection.

## Security Notes

- Passwords are handled by Better Auth, not by FinSight application code.
- Sessions use server-side auth APIs and HttpOnly cookie configuration.
- Sensitive financial routes require authentication and verified email.
- Financial queries must always include authenticated `userId`.
- `.env` must never contain committed secrets.

See `docs/SECURITY.md` for the production hardening checklist.

## Test Commands

```sh
pnpm test
pnpm run check
pnpm run build
```

## Known Limitations

- Transactional email is console-only unless configured.
- MFA UI is architectural/readiness level; full enrollment UX still needs provider-specific implementation.
- Bank provider is mock-only.
- Analytics is a privacy-conscious abstraction, not a production analytics integration.
- Account deletion, legal copy, retention rules, and compliance review are not complete.
- The legacy local MVP components remain in the repo but should be retired after data migration UX is complete.
