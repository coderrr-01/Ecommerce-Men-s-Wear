import Link from "next/link";

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
          A snapshot of the store. Full management tools are scaffolded in the sections on the left.
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
              <CardContent className="text-xs text-muted-foreground">
                {card.label === "Low stock variants"
                  ? "5 units or fewer remaining"
                  : "View details"}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

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
      </Card>
    </div>
  );
}
