# ADR 0010: WhatsApp click-to-chat instead of a payment gateway for now

- Status: Accepted
- Date: 2026-11-17

## Context

The storefront needs a usable order-request flow before online payment, verified webhooks, refunds
and related operational controls are ready. Orders still need durable records, trusted server-side
pricing, an auditable fulfilment workflow and a way for the customer and shop to confirm details.

## Decision

- Save a pending order and its immutable item/address snapshots before opening WhatsApp.
- Treat the WhatsApp message as customer communication, not proof of payment or order acceptance.
- Do not create a `Payment` record or call the payment provider during checkout.
- Deduct stock transactionally when staff confirms an order; restore it transactionally if a
  confirmed-but-unshipped order is cancelled.
- Keep shop WhatsApp, public site URL and shipping charges in `site.config.ts`.
- Keep Razorpay behind the existing `PaymentProvider` adapter; it can be added later with an
  idempotent, verified webhook before real payments are enabled.

## Consequences

Orders can be reviewed and confirmed manually without payment credentials or online charge risk.
Availability may change between placement and confirmation, so confirmation can fail if stock is
insufficient. There is no automatic payment capture, email notification, refund or customer account
order history in this phase.
