# Orders

## Customer order experience

Signed-in customers can view `/account/orders` and `/account/orders/{orderNumber}`. Every repository
read includes the authenticated user ID; missing and non-owned order numbers render as 404. Order
details use immutable item snapshots, saved delivery address, paise totals, status history and
configured shipment tracking.

Guests use `/order/{orderNumber}?token={token}`. The high-entropy token is required alongside the
human-readable order number. Both customer views render the same lifecycle timeline. Internal
admin notes are stored separately and never selected by customer or guest queries.

Every new order records its initial `PENDING` history entry. Each valid admin status transition
records `(fromStatus, toStatus, changedBy, note, createdAt)` in the same transaction as the status
change and stock effects. The compare-and-set transition rejects concurrent/double submissions.
Legacy orders without history show current progress without fabricated prior event dates.

Lifecycle:

```text
PENDING -> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED
    \          \          \
     +----------+-----------> CANCELLED
```

Confirmation checks and decrements all item quantities transactionally. If any item is unavailable,
the entire confirmation rolls back; partial fulfilment is not supported. Cancellation is available
before shipment and restores stock only if the order had committed stock.

## Admin

- `/admin/orders` supports number/phone search, status/date filters, pagination and a filtered CSV
  export. Date filters are inclusive.
- `/admin/orders/{id}` shows customer/order details, history, staff-only notes, shipment tracking and
  status-specific WhatsApp links for confirmation, shipment (with tracking number) and delivery.
- STAFF and ADMIN can save tracking/courier fields and append internal notes. Only the tracking
  fields are exposed to customer order views.
- Every mutation rechecks STAFF/ADMIN authorization. Status changes validate the transition in the
  service and commit history and inventory effects transactionally.

## Coupons and returns

Checkout accepts an optional coupon code. The preview action is rate limited; order creation
revalidates active dates, minimum amount and both usage limits against PostgreSQL within the
serializable order/cart transaction. It calculates the discount from current database prices,
persists the redemption and paise discount, and includes it in order detail, WhatsApp and invoice
totals.

Delivered customers can request a return/exchange on each order item within
`siteConfig.shipping.returnsWindowDays` from `deliveredAt`. See [returns.md](./returns.md) for
approval and receipt behavior. Stock returns only when an admin records item receipt.

## Invoice access and numbering

Invoices are available after confirmation (including later fulfilment states). A cancelled order
remains eligible only when it had already committed stock. Downloads are authorized by ADMIN/STAFF,
the owning signed-in customer, or the guest order token. Unauthorized and missing order numbers both
return 404.

An invoice number is assigned on the first authorized download. The year-specific counter and
unique `Order.invoiceNumber` are updated together in a serializable database transaction. A retry
reuses the order's assigned number; failed allocations roll back the counter so they do not consume
a number. Invoice PDFs contain order snapshots and seller configuration and do not expose admin
notes.

See [invoices.md](./invoices.md) for PDF rendering, legal configuration and deployment notes, and
[whatsapp-checkout.md](./whatsapp-checkout.md) for order placement.
