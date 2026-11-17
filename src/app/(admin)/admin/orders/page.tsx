import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminOrdersQuerySchema } from "@/features/orders/schemas/order.schema";
import { getAdminOrders } from "@/features/orders/services/admin-order.service";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const raw = await searchParams;
  const query = adminOrdersQuerySchema.parse(raw);
  const orders = await getAdminOrders(query);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Fulfilment</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.total} order requests</p>
      </div>

      <form className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[1fr_150px_150px_170px_auto_auto]">
        <Input
          name="q"
          aria-label="Search order number or phone"
          placeholder="Order number or phone"
          defaultValue={query.q}
        />
        <Input
          name="dateFrom"
          type="date"
          aria-label="Orders placed from"
          defaultValue={query.dateFrom}
        />
        <Input
          name="dateTo"
          type="date"
          aria-label="Orders placed through"
          defaultValue={query.dateTo}
        />
        <select
          name="status"
          aria-label="Filter by status"
          defaultValue={query.status}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          {["all", "PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
            (status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : status.replaceAll("_", " ")}
              </option>
            ),
          )}
        </select>
        <Button type="submit" variant="outline">
          Search orders
        </Button>
        <Button asChild variant="outline">
          <Link href={exportHref(query.status, query.dateFrom, query.dateTo)}>Export CSV</Link>
        </Button>
      </form>

      {orders.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
          No orders match this search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <ul className="divide-y divide-border">
            {orders.rows.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.customerName ?? "Guest"} · {order.customerPhone ?? "No phone"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.createdAt.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
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
        </div>
      )}

      <nav aria-label="Order pages" className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {orders.page} of {orders.totalPages}
        </span>
        <div className="flex gap-2">
          {orders.page > 1 ? (
            <Button asChild size="sm" variant="outline">
              <Link
                href={pageHref(
                  query.q,
                  query.status,
                  query.dateFrom,
                  query.dateTo,
                  orders.page - 1,
                )}
              >
                Previous
              </Link>
            </Button>
          ) : null}
          {orders.page < orders.totalPages ? (
            <Button asChild size="sm" variant="outline">
              <Link
                href={pageHref(
                  query.q,
                  query.status,
                  query.dateFrom,
                  query.dateTo,
                  orders.page + 1,
                )}
              >
                Next
              </Link>
            </Button>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

function filters(q: string, status: string, dateFrom?: string, dateTo?: string): URLSearchParams {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status !== "all") params.set("status", status);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  return params;
}

function pageHref(
  q: string,
  status: string,
  dateFrom: string | undefined,
  dateTo: string | undefined,
  page: number,
): string {
  const params = filters(q, status, dateFrom, dateTo);
  params.set("page", String(page));
  return `/admin/orders?${params.toString()}`;
}

function exportHref(status: string, dateFrom?: string, dateTo?: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const query = params.toString();
  return `/api/admin/orders/export${query ? `?${query}` : ""}`;
}
