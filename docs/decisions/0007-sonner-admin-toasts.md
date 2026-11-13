# ADR 0007: Use Sonner for admin mutation feedback

- Status: Accepted
- Date: 2026-11-13

## Context

Admin catalog and inventory screens perform asynchronous server actions and uploads. They need a
consistent place to report success, validation, authorization and provider failures without
embedding transient messages into every form or returning success-shaped fallbacks.

## Decision

- Use Sonner for admin toast notifications and mount its `Toaster` in the protected admin layout.
- Pass the safe `ApiResponse` error message to error toasts; keep server logging and typed errors in
  the existing shared error handler.
- Use native HTML drag-and-drop and keyboard-operable move buttons for image ordering rather than
  adding a drag/drop dependency.

## Consequences

- Admin screens share accessible, non-blocking mutation feedback with minimal UI code.
- The new runtime dependency is `sonner`; no carousel, table or drag/drop dependency was added.
- Toasts do not replace field validation, confirmation for destructive actions or server-side
  authorization.
