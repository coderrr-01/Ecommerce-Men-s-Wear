import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { OrderConfirmationActions } from "@/features/orders/components/order-confirmation-actions";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { getOrderConfirmation } from "@/features/orders/services/order.service";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/features/auth/services/session.service";
import { ClaimGuestOrderButton } from "@/features/orders/components/claim-guest-order-button";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.token === "string" ? query.token : "";
  const user = await getCurrentUser();
  const confirmation = await getOrderConfirmation(
    orderNumber,
    token,
    user ? { id: user.id, phone: user.phone } : null,
  );
  if (!confirmation) notFound();

  const { order } = confirmation;
  const claimReturnPath = `/order/${encodeURIComponent(order.orderNumber)}?token=${encodeURIComponent(token)}`;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="rounded-lg border border-border bg-card p-5 sm:p-8">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Order request received
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Thank you</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your order request <strong className="text-foreground">{order.orderNumber}</strong> is
          saved. Send the prepared message to the shop to continue.
        </p>
        {confirmation.canClaim ? (
          <ClaimGuestOrderButton orderNumber={order.orderNumber} token={token} />
        ) : confirmation.isClaimedByCurrentUser ? (
          <p className="mt-4 text-sm">
            This order is linked to your account.{" "}
            <Link href="/account/orders" className="underline underline-offset-4">
              View your orders
            </Link>
          </p>
        ) : user ? (
          <p className="mt-4 text-sm text-muted-foreground">
            To add a guest order to your account, use an account with the same mobile number as the
            order.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            To add this guest order to your history,{" "}
            <Link
              href={`/login?redirectTo=${encodeURIComponent(claimReturnPath)}`}
              className="underline underline-offset-4"
            >
              sign in
            </Link>{" "}
            or{" "}
            <Link
              href={`/register?redirectTo=${encodeURIComponent(claimReturnPath)}`}
              className="underline underline-offset-4"
            >
              create an account
            </Link>{" "}
            with the same mobile number used for this order.
          </p>
        )}

        <section className="mt-7 border-t border-border pt-6">
          <h2 className="mb-5 font-serif text-xl">Order status</h2>
          <OrderStatusTimeline
            status={confirmation.status}
            history={confirmation.statusHistory}
            placedAt={confirmation.placedAt}
          />
        </section>

        {confirmation.trackingNumber || confirmation.courierName ? (
          <section className="mt-6 rounded-md border border-border p-4">
            <h2 className="font-medium">Delivery tracking</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[confirmation.courierName, confirmation.trackingNumber].filter(Boolean).join(" · ")}
            </p>
            {confirmation.trackingUrl ? (
              <Button asChild size="sm" variant="outline" className="mt-3">
                <a href={confirmation.trackingUrl} target="_blank" rel="noopener noreferrer">
                  Track shipment
                </a>
              </Button>
            ) : null}
          </section>
        ) : null}

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="font-medium">Delivery details</h2>
            <p className="mt-2 text-sm leading-6">
              {order.customerName}
              <br />
              {order.customerPhone}
              <br />
              {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            {order.customerNote ? (
              <p className="mt-3 text-xs text-muted-foreground">Note: {order.customerNote}</p>
            ) : null}
          </div>
          <div>
            <h2 className="font-medium">Items</h2>
            <ul className="mt-2 divide-y divide-border border-y border-border">
              {order.items.map((item, index) => (
                <li
                  key={`${item.productSlug}-${index}`}
                  className="flex justify-between gap-4 py-2 text-sm"
                >
                  <span>
                    {item.name} · {item.color} / {item.size} · Qty {item.quantity}
                  </span>
                  <span className="shrink-0">{formatPrice(item.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {confirmation.discountTotal > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd>{formatPrice(-confirmation.discountTotal)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{order.shippingTotal === 0 ? "Free" : formatPrice(order.shippingTotal)}</dd>
              </div>
              {confirmation.taxTotal > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd>{formatPrice(confirmation.taxTotal)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.grandTotal)}</dd>
              </div>
            </dl>
            {confirmation.invoiceAvailable ? (
              <Button asChild variant="outline" className="mt-4 w-full">
                <a
                  href={`/api/orders/${encodeURIComponent(order.orderNumber)}/invoice?token=${encodeURIComponent(token)}`}
                >
                  Download invoice
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <OrderConfirmationActions
            whatsappUrl={confirmation.whatsappUrl}
            message={confirmation.message}
          />
        </div>
      </div>
      <Button asChild variant="ghost" className="mt-4">
        <Link href="/shop">Continue shopping</Link>
      </Button>
    </div>
  );
}
