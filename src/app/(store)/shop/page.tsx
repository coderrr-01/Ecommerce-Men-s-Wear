import type { Metadata } from "next";

import { ShopProductResults } from "@/features/catalog/components/shop-product-results";
import { ShopFilters } from "@/features/catalog/components/shop-filters";
import { ShopPagination } from "@/features/catalog/components/shop-pagination";
import { getCategoryOptions, getProductList } from "@/features/catalog/services/catalog.service";
import { parseCatalogSearchParams } from "@/features/catalog/schemas/catalog.schema";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = parseCatalogSearchParams(params);
  const categories = query.category ? await getCategoryOptions() : [];
  const category = categories.find((item) => item.slug === query.category);
  const canonical = new URL(
    category ? `/shop?category=${encodeURIComponent(category.slug)}` : "/shop",
    siteConfig.url,
  );
  const title = category ? `${category.name} — Shop` : "Shop";
  const description =
    category?.description ??
    "Shop shirts, T-shirts, trousers, shorts, nightwear and winter essentials from the collection.";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: siteConfig.name },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const query = parseCatalogSearchParams(params);
  const [result, categories] = await Promise.all([getProductList(query), getCategoryOptions()]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ShopFilters query={query} categories={categories} total={result.total} />

      <ShopProductResults
        key={`${query.category ?? ""}:${query.size ?? ""}:${query.page}`}
        products={result.products}
      />

      <ShopPagination query={query} totalPages={result.totalPages} />
    </div>
  );
}
