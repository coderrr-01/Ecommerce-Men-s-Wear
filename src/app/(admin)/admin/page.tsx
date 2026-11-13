import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboard } from "@/features/admin-dashboard/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Operations</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A live snapshot of catalog, inventory and customer activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="h-full gap-2 transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{card.note}</CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Low-stock variants</CardTitle>
            <CardDescription>
              The {dashboard.lowStockThreshold} lowest in-stock variants, with direct edit links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.lowStockRows.length === 0 ? (
              <p className="rounded-lg bg-muted/50 p-5 text-sm text-muted-foreground">
                No variants are currently below the configured stock threshold.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {dashboard.lowStockRows.map((variant) => (
                  <li key={variant.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${variant.product.id}/edit`}
                        className="text-sm font-medium hover:underline"
                      >
                        {variant.product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {variant.sku} · {variant.color} / {variant.size}
                      </p>
                    </div>
                    <Badge variant="accent">
                      {variant.stock} left
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Pending orders</CardTitle>
            <CardDescription>
              {dashboard.pendingOrders === 0
                ? "No orders are waiting to be confirmed."
                : `${dashboard.pendingOrders} order${
                    dashboard.pendingOrders === 1 ? "" : "s"
                  } awaiting confirmation.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">
              View orders
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
