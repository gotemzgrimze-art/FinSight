# FinSight Architecture

FinSight is organized around SvelteKit routes, server-side authentication, a Postgres data model, and deterministic financial services.

Flow:

Frontend -> Authenticated SvelteKit backend -> Financial domain services -> Drizzle/PostgreSQL

Core services:

- Auth: Better Auth in `src/lib/server/auth.ts`
- Data access: `src/lib/server/repositories/financialRepository.ts`
- Money: `src/lib/money.ts`
- Cash flow: `src/lib/finance/cashFlow.ts`
- Purchase impact: `src/lib/finance/purchaseEngine.ts`
- Bank provider abstraction: `src/lib/server/bank/providers.ts`
- Analytics abstraction: `src/lib/server/analytics.ts`
- Identity provider readiness: `src/lib/server/identity/provider.ts`

All user-owned financial objects must be fetched or mutated through authenticated user-scoped calls.
