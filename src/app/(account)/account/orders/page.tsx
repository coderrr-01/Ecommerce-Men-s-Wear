import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomerOrders } from "@/features/orders/services/customer-order.service";
import { requireUser } from "@/features/auth/services/session.service";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const [user, query] = await Promise.all([requireUser("/account/orders"), searchParams]);
  const orders = await getCustomerOrders(user.id, query.page);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Account</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight">My orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">{orders.total} order requests</p>
      </header>

      {orders.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <h3 className="font-serif text-2xl">No orders yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders placed while signed in will appear here.
          </p>
          <Button asChild className="mt-5">
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {orders.rows.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
                className="flex flex-col gap-3 p-4 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.placedAt.toLocaleDateString("en-IN")} · {order._count.items} item(s)
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Badge variant={order.status === "PENDING" ? "accent" : "outline"}>
                    {order.status.replaceAll("_", " ")}
                  </Badge>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(order.grandTotal)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <nav aria-label="Order pages" className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {orders.page} of {orders.totalPages}
        </span>
        <div className="flex gap-2">
          {orders.page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/account/orders?page=${orders.page - 1}`}>Previous</Link>
            </Button>
          ) : null}
          {orders.page < orders.totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/account/orders?page=${orders.page + 1}`}>Next</Link>
            </Button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
