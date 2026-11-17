# Checkout and orders

WhatsApp click-to-chat checkout and the first admin fulfilment workflow are implemented without
online payment. See [whatsapp-checkout.md](./whatsapp-checkout.md) for guest checkout and
[orders.md](./orders.md) for snapshots, transitions and inventory handling.

Payment capture/webhooks, refunds, tax/coupons, stock reservation, account order history and
integration tests remain future work. Razorpay remains available only through the existing
`PaymentProvider` adapter; this checkout does not call or change payment-provider code.
