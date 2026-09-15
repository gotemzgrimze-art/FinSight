# FinSight

FinSight is a SvelteKit + TypeScript front-end MVP for purchase decision planning. It helps a user compare a purchase against cash balance, income, debt obligations, savings goals, allowance limits, work-hours cost, and investment opportunity cost.

FinSight provides educational planning tools, not financial advice.

## Tech stack

- SvelteKit
- Svelte 5
- TypeScript
- Vite
- Vitest
- Tailwind CSS plugin setup
- Browser Web Crypto API for local encrypted profile storage
- Supabase Auth for email/password accounts and a username profile table

## Project structure

```text
src/
  routes/
    +layout.svelte          App layout and global stylesheet import
    +page.svelte            Main app shell, navigation, state, validation, and component wiring
    layout.css              Minimal spreadsheet-inspired UI styles
  lib/
    models.ts               Shared TypeScript models
    calculations.ts         Financial calculation engine
    calculations.test.ts    Vitest tests for calculation behavior
    profileStorage.ts       Local encrypted profile save/unlock/clear helpers
    mockData.ts             Demo profile, goals, debts, allowances, and product options
    subscription.ts         Mock subscription limits and local usage persistence
    components/
      Dashboard.svelte
      ProfileForm.svelte
      PurchaseChecker.svelte
      PurchaseResults.svelte
      GlanceOverview.svelte
      DebtTracker.svelte
      AllowanceTracker.svelte
      Paywall.svelte
      StudentDiscount.svelte
```

## Setup

For account creation, email confirmation, recovery, database migration and legal
publication settings, see [Authentication setup](docs/auth-setup.md).

Install dependencies:

```sh
pnpm install
```

Run the dev server:

```sh
pnpm run dev
```

Run type and Svelte checks:

```sh
pnpm run check
```

Build for production:

```sh
pnpm run build
```

Run tests:

```sh
pnpm test
```

## Current features

- Email/password accounts, confirmation and recovery through Supabase Auth
- Dynamic dashboard based on the local financial profile
- Editable profile fields: income, bank balance, expenses, work hours, and investment return assumption
- Editable savings goals with progress and purchase-delay impact
- Editable debt list with payoff estimates
- Editable weekly/monthly allowances with remaining balance, usage percent, and safe daily allowance spend
- Purchase checker with rule-based affordability verdict
- Purchase results with pros, cons, alternatives, work-hours impact, goal delay, and investment opportunity cost
- Mock free, premium, and student subscription tiers
- Local monthly purchase-check usage persistence for mock subscriptions
- Encrypted local profile storage using PBKDF2 and AES-GCM
- Calculation tests with Vitest

## Mocked features

- Subscription entitlements are local mock state only
- Student discount verification is a local button/state toggle
- AI-style insights are deterministic rules in `src/lib/calculations.ts`
- Product categories are static demo data
- Forecast limits are front-end mock rules

## Not implemented

- Bank integrations
- Plaid
- Real AI or LLM calls
- Real payments
- Real subscription provider
- Real student verification
- Backend storage/synchronization of financial profiles
- Analytics
- White-label mode
- Admin portal
- Swift/iOS app

## Known limitations

- `src/routes/+page.svelte` still owns much of the app orchestration and should eventually be split into smaller state helpers.
- The dashboard depends on valid local profile data and shows setup warnings when required inputs are missing.
- Subscription usage is persisted only in browser `localStorage`.
- Profile encryption is local-device only and has no account recovery.
- Purchase alternatives use configurable but simple assumptions, not a full cash-flow simulator.
- Authentication has desktop/mobile browser tests; finance component tests are not yet included.
- No production privacy, compliance, or security review has been completed.

## Roadmap

1. Verify the app in a Node + pnpm environment with `pnpm run check`, `pnpm run build`, and `pnpm test`.
2. Add component tests for profile editing, allowance editing, and purchase checks.
3. Split page-level state and validation out of `+page.svelte`.
4. Add explicit purchase-impact timelines for goals and debts.
5. Improve local storage migration/versioning.
6. Add production-ready legal, privacy, and accessibility review before any public launch.
