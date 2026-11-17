import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { getCustomerOrder } from "@/features/orders/services/customer-order.service";
import { requireUser } from "@/features/auth/services/session.service";
import { formatPrice } from "@/lib/utils";
import { NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function CustomerOrderPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const [{ orderNumber }, user] = await Promise.all([params, requireUser("/account/orders")]);
  let order: Awaited<ReturnType<typeof getCustomerOrder>>;
  try {
    order = await getCustomerOrder(orderNumber, user.id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/account/orders">← My orders</Link>
      </Button>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Order details
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.placedAt.toLocaleString("en-IN")}
          </p>
        </div>
        <Badge variant={order.status === "PENDING" ? "accent" : "outline"}>
          {order.status.replaceAll("_", " ")}
        </Badge>
      </header>

      <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
        <h3 className="mb-5 font-serif text-xl">Order status</h3>
        <OrderStatusTimeline
          status={order.status}
          history={order.statusHistory}
          placedAt={order.placedAt}
        />
      </section>

      {order.trackingNumber || order.courierName ? (
        <section className="rounded-lg border border-border bg-background p-5">
          <h3 className="font-serif text-xl">Delivery tracking</h3>
          <p className="mt-2 text-sm">
            {[order.courierName, order.trackingNumber].filter(Boolean).join(" · ")}
          </p>
          {order.trackingUrl ? (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                Track shipment
              </a>
            </Button>
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(250px,0.7fr)]">
        <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
          <h3 className="font-serif text-xl">Items</h3>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    SKU {item.sku} · {item.color} / {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatPrice(item.total)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 ml-auto max-w-xs space-y-2 text-sm">
            <Amount label="Subtotal" amount={order.subtotal} />
            {order.discountTotal > 0 ? (
              <Amount label="Discount" amount={-order.discountTotal} />
            ) : null}
            <Amount label="Delivery" amount={order.shippingTotal} freeWhenZero />
            {order.taxTotal > 0 ? <Amount label="Tax" amount={order.taxTotal} /> : null}
            <Amount label="Total" amount={order.grandTotal} strong />
          </dl>
          {order.invoiceAvailable ? (
            <Button asChild variant="outline" className="mt-5 w-full sm:w-auto">
              <a href={`/api/orders/${encodeURIComponent(order.orderNumber)}/invoice`}>
                Download invoice
              </a>
            </Button>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-background p-5">
            <h3 className="font-serif text-xl">Delivery address</h3>
            <p className="mt-3 text-sm leading-6">
              {address.fullName}
              <br />
              {address.phone}
              <br />
              {address.line1}
              <br />
              {address.city}, {address.state} {address.postalCode}
            </p>
          </section>
          {order.customerNote ? (
            <section className="rounded-lg border border-border bg-background p-5">
              <h3 className="font-serif text-xl">Your note</h3>
              <p className="mt-2 text-sm leading-6">{order.customerNote}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Amount({
  label,
  amount,
  freeWhenZero = false,
  strong = false,
}: {
  label: string;
  amount: number;
  freeWhenZero?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${strong ? "border-t border-border pt-3 text-base font-semibold" : ""}`}
    >
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd>{freeWhenZero && amount === 0 ? "Free" : formatPrice(amount)}</dd>
    </div>
  );
}
