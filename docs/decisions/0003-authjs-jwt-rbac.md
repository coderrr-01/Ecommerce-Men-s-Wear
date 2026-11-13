# ADR 0003: Auth.js JWT sessions with DB-backed guards

- Status: Accepted
- Date: 2026-11-13

## Context

Auth.js 5 beta is available. The store needs credentials login, roles (`CUSTOMER`, `STAFF`, `ADMIN`), immediate deactivation, and simple server-side guards without a separate session table.

## Decision

- Use Auth.js credentials provider with JWT session strategy.
- Hash passwords with bcrypt cost 12; use a dummy comparison for unknown emails.
- Put `role` and user id in the token/session.
- Treat proxy redirects as optimistic only. Use `getCurrentUser`/`requireUser`/`requireRole` for DB-backed authorization in layouts and actions.
- Reject inactive or soft-deleted users in both the provider and session guard.
- Accept both `ADMIN` and `STAFF` on admin routes.

## Consequences

- Role changes and deactivation take effect on the next DB-backed check without waiting for token expiry.
- Session reads add a database query; `getCurrentUser`/`getSession` are request-cached.
- Future refresh-token/role rotation can update the token via the `jwt` callback.
- Password reset, email verification and login rate limiting are still required before production launch.
