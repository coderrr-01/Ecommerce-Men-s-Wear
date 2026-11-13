# ADR 0004: Provider adapters with development mocks

- Status: Accepted
- Date: 2026-11-13

## Context

Payments, media storage and messaging must be replaceable and testable without binding business logic to vendor SDKs. Local development should work without live credentials.

## Decision

- Define interfaces in `src/lib/providers/` for payment, storage, email and SMS.
- Select implementations with factories driven by validated env vars.
- Provide a mock payment provider for development and a Razorpay adapter using `fetch` plus HMAC signature helpers.
- Provide console email/SMS adapters and a Cloudinary storage adapter.
- Business services depend on interfaces; routes/actions never instantiate vendor SDKs directly.
- Never log secrets or raw credentials; provider errors are wrapped in `ProviderError`.

## Consequences

- Development and tests can run without external accounts.
- Adding a provider means implementing an interface and extending the factory/env schema.
- The Razorpay path still needs a verified webhook route before real payments.
- Cloudinary uploads require server-side signing; do not expose the API secret to clients.
