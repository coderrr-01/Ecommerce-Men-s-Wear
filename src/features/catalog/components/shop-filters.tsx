import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_PAGE_SIZE, STOREFRONT_SORT_OPTIONS } from "@/config/constants";
import type { CatalogQuery, CategoryOption } from "@/features/catalog/types";
import { buildCatalogHref } from "@/features/catalog/utils";
import { cn } from "@/lib/utils";

const FILTER_SIZES = ["S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38"];

interface ShopFiltersProps {
  query: CatalogQuery;
  categories: CategoryOption[];
  total: number;
}

export function ShopFilters({ query, categories, total }: ShopFiltersProps) {
  const activeCategory = categories.find((category) => category.slug === query.category);
  const title = activeCategory
    ? activeCategory.name
    : query.q
      ? `Results for “${query.q}”`
      : "All menswear";
  const subtitle = activeCategory?.description
    ? activeCategory.description
    : `${total} considered pieces for the modern wardrobe.`;

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          The collection
        </p>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <form
        action="/shop"
        method="get"
        className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center"
      >
        <Input
          type="search"
          name="q"
          defaultValue={query.q}
          placeholder="Search shirts, linen, overcoats…"
          className="lg:max-w-xs"
          aria-label="Search products"
        />
        <div className="flex flex-wrap gap-3">
          <select
            name="category"
            defaultValue={query.category ?? ""}
            aria-label="Category"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="size"
            defaultValue={query.size ?? ""}
            aria-label="Size"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All sizes</option>
            {FILTER_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={query.sort}
            aria-label="Sort products"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {STOREFRONT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </div>
        <p className="text-xs text-muted-foreground lg:ml-auto">
          {total} {total === 1 ? "piece" : "pieces"}
          {total > DEFAULT_PAGE_SIZE ? " · paginated" : ""}
        </p>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildCatalogHref({
            q: query.q,
            size: query.size,
            sort: query.sort,
          })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors",
            !query.category
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground",
          )}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={buildCatalogHref({
              q: query.q,
              size: query.size,
              sort: query.sort,
              category: category.slug,
            })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              query.category === category.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
