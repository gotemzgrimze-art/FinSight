# Authentication change inventory

## Files created

- [.env.example](../.env.example)
- [docs/auth-changes.md](../docs/auth-changes.md)
- [docs/auth-setup.md](../docs/auth-setup.md)
- [e2e/auth.pw.ts](../e2e/auth.pw.ts)
- [playwright.config.ts](../playwright.config.ts)
- [src/hooks.server.ts](../src/hooks.server.ts)
- [src/lib/auth/account-profiles.test.ts](../src/lib/auth/account-profiles.test.ts)
- [src/lib/auth/validation.test.ts](../src/lib/auth/validation.test.ts)
- [src/lib/auth/validation.ts](../src/lib/auth/validation.ts)
- [src/lib/components/AuthForm.svelte](../src/lib/components/AuthForm.svelte)
- [src/lib/components/AuthShell.svelte](../src/lib/components/AuthShell.svelte)
- [src/lib/components/LegalPage.svelte](../src/lib/components/LegalPage.svelte)
- [src/lib/server/auth-actions.test.ts](../src/lib/server/auth-actions.test.ts)
- [src/lib/server/auth-actions.ts](../src/lib/server/auth-actions.ts)
- [src/lib/server/auth-config.ts](../src/lib/server/auth-config.ts)
- [src/routes/+layout.server.ts](../src/routes/+layout.server.ts)
- [src/routes/auth/confirm/+server.ts](../src/routes/auth/confirm/+server.ts)
- [src/routes/forgot-email/+page.svelte](../src/routes/forgot-email/+page.svelte)
- [src/routes/forgot-password/+page.server.ts](../src/routes/forgot-password/+page.server.ts)
- [src/routes/forgot-password/+page.svelte](../src/routes/forgot-password/+page.svelte)
- [src/routes/login/+page.server.ts](../src/routes/login/+page.server.ts)
- [src/routes/login/+page.svelte](../src/routes/login/+page.svelte)
- [src/routes/logout/+server.ts](../src/routes/logout/+server.ts)
- [src/routes/privacy/+page.server.ts](../src/routes/privacy/+page.server.ts)
- [src/routes/privacy/+page.svelte](../src/routes/privacy/+page.svelte)
- [src/routes/reset-password/+page.server.ts](../src/routes/reset-password/+page.server.ts)
- [src/routes/reset-password/+page.svelte](../src/routes/reset-password/+page.svelte)
- [src/routes/signup/+page.server.ts](../src/routes/signup/+page.server.ts)
- [src/routes/signup/+page.svelte](../src/routes/signup/+page.svelte)
- [src/routes/terms/+page.server.ts](../src/routes/terms/+page.server.ts)
- [src/routes/terms/+page.svelte](../src/routes/terms/+page.svelte)
- [supabase/migrations/202609150001_account_profiles.sql](../supabase/migrations/202609150001_account_profiles.sql)

## Files changed

- [.gitignore](../.gitignore)
- [README.md](../README.md)
- [package.json](../package.json)
- [pnpm-lock.yaml](../pnpm-lock.yaml)
- [src/app.d.ts](../src/app.d.ts)
- [src/lib/profileStorage.ts](../src/lib/profileStorage.ts)
- [src/routes/+page.svelte](../src/routes/+page.svelte)

The profileStorage.ts change is a one-line ArrayBuffer conversion fixing a pre-existing TypeScript error. Financial calculations were not changed.

See [Authentication setup](auth-setup.md) for Supabase, email templates and legal publication settings.
