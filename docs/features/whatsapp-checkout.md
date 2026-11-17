# WhatsApp checkout

## Flow

`/cart` supports both signed-in and guest carts. Guest cart ownership is an opaque random UUID in
an HTTP-only, SameSite=Lax cookie; cart repositories scope every read and mutation to that owner.
The cookie is created when a guest adds an item. Checkout does not require an account. Signed-in
customers get their saved name, phone and most recently used default shipping address prefilled.

`/checkout` uses React Hook Form and the shared Zod schema for name, Indian 10-digit mobile,
address, city, state, six-digit pincode and optional note. The page shows prices from the cart and
shipping rules from `siteConfig`. A fresh idempotency key is generated for the form, and the
honeypot field must remain empty.

The `placeOrderAction` revalidates input and resolves the cart owner from the authenticated user or
HTTP-only guest cookie. In one database transaction it reloads all cart variants and products,
requires active/non-deleted records, validates quantities and stock, prices from `ProductVariant.price`
in paise, creates the pending `WHATSAPP` order and its immutable item snapshots, then clears the
cart. A displayed subtotal is used only to detect stale prices; it is never used to calculate the
order. Stock is not reserved or decremented at placement.

The action returns the order number, WhatsApp URL and success URL. The customer is navigated to
`/order/{orderNumber}?token={unguessable-token}`; the confirmation page requires both values and
works for guests without exposing orders by sequential number. It reconstructs the WhatsApp message
from saved order snapshots, so the button still works after returning later. Sending is a normal
`target="_blank"` link with `rel="noopener noreferrer"`; there is no automatic WhatsApp redirect.
The copy button and visible message provide a fallback.

## WhatsApp message and configuration

`buildWhatsAppOrderMessage(order, siteConfig)` is pure and unit-tested. It includes the order,
customer/delivery details, note, item name/size/colour/quantity/line total and absolute product
links, plus subtotal, delivery and total. If the full message is over 1500 characters, it shortens
item lines and adds the token-protected full-order URL. The URL uses `encodeURIComponent`.

Set these values in `src/config/site.config.ts` before accepting real orders:

- `contact.whatsapp`: shop number, including country code; formatting characters are removed when
  constructing `wa.me` links.
- `contact.countryCallingCode`: country calling code for admin-to-customer chat links.
- `url`: canonical public HTTPS site URL, used for product links and the private order link.
- `shipping.standardFee` and `shipping.freeShippingThreshold`: integer paise.

The checked-in WhatsApp number is a placeholder and must be replaced; the order action rejects the
all-zero placeholder before creating an order.

## Abuse and validation

Inputs are trimmed and stripped of control/bidi formatting characters while preserving Indian
scripts and punctuation. The action applies a five-orders-per-hour sliding window by phone and,
when present, the forwarded client IP. The limiter is in-memory and therefore per application
process; production deployments with multiple instances should replace it with a shared store.
Only hashes of limiter keys and guest session IDs are retained in process memory/database; request
payloads, addresses and full phone numbers are not logged.

Empty carts, changed prices, inactive/deleted products, unavailable variants and quantities above
current stock are rejected. The unique idempotency key protects retries/double submits. Checkout
does not calculate tax, reserve inventory or collect payment.

## Files and verification

- `src/features/orders/schemas/order.schema.ts` — boundary schemas and text sanitation.
- `src/features/orders/pricing.utils.ts` and `utils.ts` — pure paise pricing/message rules.
- `src/features/orders/actions/order.actions.ts` — order and admin status actions.
- `src/features/orders/services/order.service.ts` — checkout, lookup and WhatsApp assembly.
- `src/features/orders/repositories/order.repository.ts` — Prisma transaction and data access.
- `src/app/(store)/checkout/page.tsx` and `src/app/(store)/order/[orderNumber]/page.tsx` — pages.
- `tests/unit/orders-utils.test.ts` — pricing, number, message length and URL encoding.

See [orders.md](./orders.md), [DATABASE.md](../DATABASE.md), [API.md](../API.md) and
[ADR 0010](../decisions/0010-whatsapp-click-to-chat.md).
