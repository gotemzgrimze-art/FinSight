# Production Checklist

Before beta:

- Configure PostgreSQL and run migrations
- Configure Better Auth secret and production URL
- Configure real email delivery
- Add rate limiting
- Add security headers and CSP
- Add CI for test, type-check, build, dependency scanning, and secret scanning
- Complete account deletion and export UX
- Complete MFA enrollment/recovery UX
- Validate all financial forms server-side
- Add browser/e2e tests for auth and onboarding

Before bank/fintech partnership discussions:

- Complete privacy/legal review
- Complete threat model
- Complete data retention policy
- Complete incident response plan
- Add audit-log review tooling
- Add bank-provider monitoring and revocation flows
- Add SOC2-style control mapping if required by partners
