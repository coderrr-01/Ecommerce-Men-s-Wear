"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bulkProductsAction } from "@/features/catalog/actions/product-admin.actions";
import type { ProductListQuery } from "@/features/catalog/schemas/product.schema";
import type { AdminProductRow } from "@/features/catalog/types";
import { formatPrice } from "@/lib/utils";

function pageHref(query: ProductListQuery, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, page })) {
    if (value !== "" && value !== "all" && value !== "newest") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `/admin/products?${search}` : "/admin/products";
}

export function ProductTable({
  products,
  query,
  total,
  page,
  totalPages,
  isAdmin,
}: {
  products: AdminProductRow[];
  query: ProductListQuery;
  total: number;
  page: number;
  totalPages: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<"activate" | "deactivate" | "delete">("activate");
  const [pending, setPending] = useState(false);

  async function applyBulkAction() {
    if (selected.length === 0) return;
    if (
      action === "delete" &&
      !window.confirm(`Soft-delete ${selected.length} selected products and their variants?`)
    ) {
      return;
    }

    setPending(true);
    const response = await bulkProductsAction({ ids: selected, action });
    setPending(false);
    if (!response.success) {
      toast.error(response.error.message);
      return;
    }
    toast.success(
      `${response.data.updated} product${response.data.updated === 1 ? "" : "s"} updated.`,
    );
    setSelected([]);
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{total} products</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={action}
            onChange={(event) => setAction(event.target.value as typeof action)}
            aria-label="Bulk product action"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            {isAdmin ? <option value="delete">Soft delete</option> : null}
          </select>
          <Button
            type="button"
            size="sm"
            onClick={() => void applyBulkAction()}
            disabled={!selected.length || pending}
          >
            {pending ? "Updating…" : `Apply to ${selected.length}`}
          </Button>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-12 text-center">
          <h2 className="font-serif text-2xl">No products found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Adjust the filters or add a new product.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-secondary/60 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all products on this page"
                    checked={
                      products.length > 0 &&
                      products.every((product) => selected.includes(product.id))
                    }
                    onChange={(event) =>
                      setSelected(event.target.checked ? products.map((product) => product.id) : [])
                    }
                  />
                </th>
                <th scope="col" className="px-4 py-3">
                  Product
                </th>
                <th scope="col" className="px-4 py-3">
                  Category
                </th>
                <th scope="col" className="px-4 py-3">
                  Variants / stock
                </th>
                <th scope="col" className="px-4 py-3">
                  Price from
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      aria-label={`Select ${product.name}`}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, product.id]
                            : current.filter((id) => id !== product.id),
                        )
                      }
                    />
                  </td>
                  <th scope="row" className="px-4 py-3 font-medium">
                    <span className="block">{product.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {product.slug}
                    </span>
                  </th>
                  <td className="px-4 py-3">{product.category.name}</td>
                  <td className="px-4 py-3">
                    {product.variantCount} / {product.totalStock}
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={product.isActive ? "secondary" : "outline"}>
                        {product.isActive ? "Active" : "Draft"}
                      </Badge>
                      {product.isFeatured ? <Badge variant="accent">Featured</Badge> : null}
                      {product.isNewArrival ? <Badge variant="outline">New arrival</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 ? (
        <nav aria-label="Product pages" className="flex items-center justify-between">
          <Button asChild variant="outline" size="sm" aria-disabled={page <= 1}>
            <Link href={pageHref(query, Math.max(1, page - 1))}>Previous</Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" aria-disabled={page >= totalPages}>
            <Link href={pageHref(query, Math.min(totalPages, page + 1))}>Next</Link>
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
