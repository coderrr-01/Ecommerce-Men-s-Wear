# Authentication

## Flow

- Credentials only: email + password. Passwords are bcrypt hashes (cost 12).
- Auth.js runs with the JWT session strategy; the role is copied into the token and session.
- Registration always creates `CUSTOMER`; staff/admin roles are assigned directly in the database or a future admin screen.
- Unknown emails run a dummy bcrypt comparison to reduce timing differences.
- Inactive or soft-deleted users are rejected by the credentials provider and by the DB-backed session guard.

## Routes

| Route              | Access             | Notes                                                                   |
| ------------------ | ------------------ | ----------------------------------------------------------------------- |
| `/login`           | Public             | Redirects authenticated users to `/account`; supports safe `redirectTo` |
| `/register`        | Public             | Creates a customer and sends them to login                              |
| `/forgot-password` | Public             | UI shell only; reset email is not implemented                           |
| `/account/*`       | Signed in          | Layout and `requireUser` guard                                          |
| `/admin/*`         | `ADMIN` or `STAFF` | Layout and `requireRole` guard                                          |
| `/unauthorized`    | Public             | Access-denied page                                                      |

## Guards

- `src/proxy.ts` performs optimistic cookie-based redirects. It does not hit the database and must not be treated as authorization.
- `src/features/auth/services/session.service.ts`:
  - `getSession`: cached Auth.js session.
  - `getCurrentUser`: cached DB lookup, returns `null` if inactive/deleted.
  - `requireUser`: redirects to login when absent.
  - `requireRole`: redirects to login/unauthorized.
  - `hasRole`: pure role membership check.
- Server actions and route handlers must call the DB-backed guards themselves; proxy redirects alone are insufficient.

## Files

- `src/auth.ts` — NextAuth configuration.
- `src/types/next-auth.d.ts` — session/user/JWT type augmentation.
- `src/proxy.ts` — route protection matcher.
- `src/features/auth/actions/auth.actions.ts` — login/register/logout.
- `src/features/auth/schemas/auth.schemas.ts` — Zod validation.
- `src/features/auth/components/*` — forms with `useActionState`.

## Known gaps

- Password reset email and token flow.
- Email verification.
- OAuth providers.
- Rate limiting on login/register.
- Admin UI for changing roles or deactivating users.
