# Coupons

STAFF/ADMIN manage percentage or fixed-paise coupons at `/admin/coupons`. Codes are trimmed and
uppercased both when saved and looked up. Percentage values are whole percent; flat values,
minimum order and maximum discount are integer paise. Date-time fields represent local time in the
admin form and are submitted/stored as UTC instants.

Checkout coupon checks are rate limited. Unknown codes return one generic message for guests and
signed-in customers. Known codes return a safe reason the customer can act on: inactive, not started,
expired, minimum subtotal, global usage limit or per-customer limit. Server logs record only a
reason code, never the coupon input, phone, or customer identity. Empty carts have a separate message.
Checks are previews only. Order placement reloads cart prices and coupon rules from PostgreSQL,
computes shipping/discount in paise, and creates the order/redemption in the same serializable
transaction. A conditional `usedCount` increment and per-customer redemption count prevent
concurrent orders exceeding either cap; failed transactions do not consume a use.

The order snapshot stores `couponId` and `discountTotal`. Customer/admin order views, WhatsApp
messages and invoices show the saved discount. Fixed coupon values and order thresholds are paise.
The checkout's expected subtotal is only a stale-price check and is never used to calculate prices.
The admin form labels the discount amount according to type and displays stored rupee thresholds
as paise input fields.
