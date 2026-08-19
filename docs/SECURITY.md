# Security

Implemented foundation:

- Better Auth email/password authentication
- Minimum 12-character password validation
- Email verification requirement for sensitive financial routes
- Password reset architecture
- HttpOnly, SameSite cookie configuration
- Server-side route protection in `src/hooks.server.ts`
- User-scoped financial repository queries
- Audit event table foundation
- Sensitive log redaction helper
- `.env.example` without real secrets

Still required before production:

- Real transactional email provider
- Production `BETTER_AUTH_SECRET`
- HTTPS-only deployment
- CSP and full security headers review
- Rate limiting at edge/server
- Brute-force monitoring and account alerting
- Dependency and secret scanning in CI
- Database backups and restore drills
- Legal review for privacy/account deletion/retention flows
- Full MFA enrollment and recovery UX
