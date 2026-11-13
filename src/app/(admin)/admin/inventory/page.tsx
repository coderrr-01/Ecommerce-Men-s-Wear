import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import { InventoryTable } from "@/features/inventory/components/inventory-table";
import { parseInventoryQuery } from "@/features/inventory/schemas/inventory.schema";
import { getInventory } from "@/features/inventory/services/inventory.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseInventoryQuery(await searchParams);
  await requireRole(ADMIN_ROLES);
  const inventory = await getInventory(query);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Operations</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor stock by variant. Every adjustment is recorded in the stock audit history.
        </p>
      </header>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-background p-4">
        <label className="min-w-52 flex-1 space-y-1 text-xs font-medium text-muted-foreground">
          Search product or SKU
          <Input name="q" defaultValue={query.q} maxLength={100} placeholder="Search inventory…" />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Stock state
          <select
            name="state"
            defaultValue={query.state}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline">
          <Link href="/admin/inventory">Clear</Link>
        </Button>
      </form>

      <InventoryTable
        rows={inventory.rows}
        query={query}
        total={inventory.total}
        page={inventory.page}
        totalPages={inventory.totalPages}
        lowStockThreshold={inventory.lowStockThreshold}
      />
    </div>
  );
}
