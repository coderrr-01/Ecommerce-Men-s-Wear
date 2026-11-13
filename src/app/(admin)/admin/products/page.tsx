import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductListFilters } from "@/features/catalog/components/product-list-filters";
import { ProductTable } from "@/features/catalog/components/product-table";
import {
  getProductFormData,
  getAdminProductList,
} from "@/features/catalog/services/product-admin.service";
import { parseProductListQuery } from "@/features/catalog/schemas/product.schema";
import { requireRole } from "@/features/auth/services/session.service";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseProductListQuery(await searchParams);
  const [user, result, form] = await Promise.all([
    requireRole(["ADMIN", "STAFF"]),
    getAdminProductList(query),
    getProductFormData(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Catalogue</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product content, variants, visibility and pricing.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </header>
      <ProductListFilters query={query} categories={form.categories} />
      <ProductTable
        products={result.products}
        query={{ ...query, page: result.page }}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        isAdmin={user.role === "ADMIN"}
      />
    </div>
  );
}
