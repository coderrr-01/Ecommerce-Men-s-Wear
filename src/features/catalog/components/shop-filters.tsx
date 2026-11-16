"use client";

import { useRef } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_PAGE_SIZE, STOREFRONT_SORT_OPTIONS } from "@/config/constants";
import type { CatalogQuery, CategoryOption } from "@/features/catalog/types";
import {
  ActiveFilterChips,
  ShopCategoryChips,
} from "@/features/catalog/components/shop-filter-chips";

const FILTER_SIZES = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];

interface ShopFiltersProps {
  query: CatalogQuery;
  categories: CategoryOption[];
  total: number;
}

export function ShopFilters({ query, categories, total }: ShopFiltersProps) {
  const form = useRef<HTMLFormElement>(null);
  const filterPanel = useRef<HTMLDetailsElement>(null);
  const searchTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const activeCategory = categories.find((category) => category.slug === query.category);
  const title = activeCategory
    ? activeCategory.name
    : query.q
      ? `Results for “${query.q}”`
      : "All menswear";
  const subtitle = activeCategory?.description ?? `${total} pieces in the collection.`;

  useEffect(
    () => () => {
      if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    },
    [],
  );

  function applyFilters() {
    if (!form.current) return;
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form.current).entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value);
    }
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          The collection
        </p>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <form
        ref={form}
        action="/shop"
        method="get"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
        className="border-y border-border py-3"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            type="search"
            name="q"
            key={query.q ?? ""}
            defaultValue={query.q}
            placeholder="Search the collection"
            className="min-h-11 lg:max-w-xs"
            aria-label="Search products"
            onChange={() => {
              if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
              searchTimer.current = window.setTimeout(applyFilters, 320);
            }}
          />
          <details ref={filterPanel} className="filter-disclosure min-w-0 flex-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs font-medium lg:hidden [&::-webkit-details-marker]:hidden">
              <span>Filter and sort</span>
              <span aria-hidden="true" className="text-muted-foreground">
                +
              </span>
            </summary>
            <div
              className="filter-disclosure-content flex flex-col gap-3 pt-2 lg:flex-row lg:items-center lg:pt-0"
              onTouchStart={(event) => {
                event.currentTarget.dataset.touchStartY = String(event.touches[0]?.clientY ?? 0);
              }}
              onTouchEnd={(event) => {
                const startY = Number(event.currentTarget.dataset.touchStartY ?? 0);
                const endY = event.changedTouches[0]?.clientY ?? startY;
                if (endY - startY > 72 && filterPanel.current) filterPanel.current.open = false;
              }}
            >
              <select
                name="category"
                defaultValue={query.category ?? ""}
                aria-label="Category"
                onChange={applyFilters}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
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
                onChange={applyFilters}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
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
                onChange={applyFilters}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                {STOREFRONT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <fieldset disabled className="space-y-1 text-xs text-muted-foreground">
                <legend className="font-medium text-foreground">Colour</legend>
                <p>Colour filters need variant data in the listing results.</p>
              </fieldset>
              <Button type="submit" variant="outline" className="min-h-11">
                Apply filters
              </Button>
            </div>
          </details>
          <p className="text-xs text-muted-foreground lg:ml-auto">
            {total} {total === 1 ? "piece" : "pieces"}
            {total > DEFAULT_PAGE_SIZE ? " · paginated" : ""}
          </p>
        </div>
      </form>

      <ActiveFilterChips query={query} categories={categories} />
      <ShopCategoryChips query={query} categories={categories} />
    </div>
  );
}
