import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminOrderSidebar } from "@/features/orders/components/admin-order-sidebar";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { getAdminOrder } from "@/features/orders/services/admin-order.service";
import { formatPrice } from "@/lib/utils";
import { NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  let order: Awaited<ReturnType<typeof getAdminOrder>>;
  try {
    order = await getAdminOrder(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/orders">← All orders</Link>
      </Button>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Order details
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleString("en-IN")}
          </p>
        </div>
        <Badge variant={order.status === "PENDING" ? "accent" : "outline"}>
          {order.status.replaceAll("_", " ")}
        </Badge>
      </header>

      <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
        <h2 className="mb-5 font-serif text-xl">Status timeline</h2>
        <OrderStatusTimeline
          status={order.status}
          history={order.statusHistory}
          placedAt={order.placedAt}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <section className="rounded-lg border border-border bg-background p-5 sm:p-6">
          <h2 className="font-serif text-xl">Items</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    SKU {item.sku} · {item.color} / {item.size} · Qty {item.quantity}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Unit {formatPrice(item.price)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatPrice(item.total)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{order.shippingTotal === 0 ? "Free" : formatPrice(order.shippingTotal)}</dd>
            </div>
            {order.discountTotal > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Discount</dt>
                <dd>{formatPrice(-order.discountTotal)}</dd>
              </div>
            ) : null}
            {order.taxTotal > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>{formatPrice(order.taxTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.grandTotal)}</dd>
            </div>
          </dl>
          {order.invoiceAvailable ? (
            <Button asChild variant="outline" className="mt-5">
              <a href={`/api/orders/${encodeURIComponent(order.orderNumber)}/invoice`}>
                Download invoice
              </a>
            </Button>
          ) : null}
        </section>

        <AdminOrderSidebar order={order} />
      </div>
    </div>
  );
}
