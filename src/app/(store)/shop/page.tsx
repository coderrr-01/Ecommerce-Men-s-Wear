import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { ShopFilters } from "@/features/catalog/components/shop-filters";
import { ShopPagination } from "@/features/catalog/components/shop-pagination";
import { getCategoryOptions, getProductList } from "@/features/catalog/services/catalog.service";
import { parseCatalogSearchParams } from "@/features/catalog/schemas/catalog.schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop considered menswear: shirts, t-shirts, trousers, outerwear and ethnic pieces.",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const query = parseCatalogSearchParams(params);
  const [result, categories] = await Promise.all([getProductList(query), getCategoryOptions()]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ShopFilters query={query} categories={categories} total={result.total} />

      <div className="mt-9">
        {result.products.length > 0 ? (
          <ProductGrid products={result.products} priorityCount={4} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-serif text-2xl">Nothing matched that search</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try a different category or size, or browse the full collection.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/shop">Clear filters</Link>
            </Button>
          </div>
        )}
      </div>

      <ShopPagination query={query} totalPages={result.totalPages} />
    </div>
  );
}
