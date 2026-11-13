"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bulkUpdateStockAction, updateVariantStockAction } from "@/features/inventory/actions/inventory.actions";
import type { InventoryQuery } from "@/features/inventory/schemas/inventory.schema";
import type { InventoryRow } from "@/features/inventory/types";
import { InventoryRowEditor } from "@/features/inventory/components/inventory-row-editor";

function pageHref(query: InventoryQuery, page: number): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.state !== "all") params.set("state", query.state);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/inventory?${search}` : "/admin/inventory";
}

export function InventoryTable({
  rows,
  query,
  total,
  page,
  totalPages,
  lowStockThreshold,
}: {
  rows: InventoryRow[];
  query: InventoryQuery;
  total: number;
  page: number;
  totalPages: number;
  lowStockThreshold: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [targetStock, setTargetStock] = useState("");
  const [pending, setPending] = useState(false);

  async function saveOne(variantId: string, stock: number): Promise<boolean> {
    setPending(true);
    const response = await updateVariantStockAction({ variantId, stock });
    setPending(false);
    if (!response.success) {
      toast.error(response.error.message);
      return false;
    }
    toast.success("Stock updated.");
    router.refresh();
    return true;
  }

  async function saveBulk() {
    const stock = Number(targetStock);
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1_000_000) {
      toast.error("Enter a whole stock quantity between 0 and 1,000,000.");
      return;
    }
    setPending(true);
    const response = await bulkUpdateStockAction({
      items: selected.map((variantId) => ({ variantId, stock })),
    });
    setPending(false);
    if (!response.success) {
      toast.error(response.error.message);
      return;
    }
    toast.success(`${response.data.updated} variant${response.data.updated === 1 ? "" : "s"} updated.`);
    setSelected([]);
    setTargetStock("");
    router.refresh();
  }

  const exportParams = new URLSearchParams();
  if (query.q) exportParams.set("q", query.q);
  if (query.state !== "all") exportParams.set("state", query.state);
  const exportSearch = exportParams.toString();
  const exportHref = `/api/admin/inventory/export${exportSearch ? `?${exportSearch}` : ""}`;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} variants · low stock at {lowStockThreshold} or fewer
        </p>
        <Button asChild variant="outline" size="sm">
          <a href={exportHref} download="inventory.csv">Export CSV</a>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-3">
        <p className="mr-auto text-sm font-medium">{selected.length} selected</p>
        <label className="space-y-1 text-xs text-muted-foreground">
          Set stock
          <Input
            type="number"
            min={0}
            max={1_000_000}
            step={1}
            value={targetStock}
            aria-label="Bulk stock quantity"
            onChange={(event) => setTargetStock(event.currentTarget.value)}
            className="h-9 w-32"
          />
        </label>
        <Button type="button" size="sm" disabled={pending || !selected.length} onClick={() => void saveBulk()}>
          {pending ? "Updating…" : "Update selected"}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-12 text-center">
          <h2 className="font-serif text-2xl">No inventory found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Adjust the filters or add product variants.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-secondary/60 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all variants on this page"
                    checked={rows.length > 0 && rows.every((row) => selected.includes(row.id))}
                    onChange={(event) =>
                      setSelected(event.target.checked ? rows.map((row) => row.id) : [])
                    }
                  />
                </th>
                <th scope="col" className="px-4 py-3">Product</th>
                <th scope="col" className="px-4 py-3">SKU</th>
                <th scope="col" className="px-4 py-3">Size</th>
                <th scope="col" className="px-4 py-3">Color</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <InventoryRowEditor
                  key={`${row.id}:${row.stock}`}
                  row={row}
                  selected={selected.includes(row.id)}
                  disabled={pending}
                  onSelect={(isSelected) =>
                    setSelected((current) =>
                      isSelected
                        ? [...current, row.id]
                        : current.filter((id) => id !== row.id),
                    )
                  }
                  onSave={saveOne}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <nav aria-label="Inventory pages" className="flex items-center justify-between">
          <Button asChild variant="outline" size="sm" aria-disabled={page <= 1}>
            <Link href={pageHref(query, Math.max(1, page - 1))}>Previous</Link>
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button asChild variant="outline" size="sm" aria-disabled={page >= totalPages}>
            <Link href={pageHref(query, Math.min(totalPages, page + 1))}>Next</Link>
          </Button>
        </nav>
      )}
    </section>
  );
}
