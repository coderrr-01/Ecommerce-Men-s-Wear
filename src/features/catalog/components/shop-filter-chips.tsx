"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import type { CatalogQuery, CategoryOption } from "@/features/catalog/types";
import { buildCatalogHref } from "@/features/catalog/utils";
import { motionDuration, motionEasing } from "@/lib/motion";

export function ActiveFilterChips({
  query,
  categories,
}: {
  query: CatalogQuery;
  categories: CategoryOption[];
}) {
  const activeCategory = categories.find((category) => category.slug === query.category);

  return (
    <AnimatePresence mode="popLayout">
      {query.q || query.category || query.size ? (
        <motion.div
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: motionDuration.fast, ease: motionEasing.enter }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="mr-1 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            Active filters
          </span>
          {query.q ? (
            <Link
              href={buildCatalogHref({
                category: query.category,
                size: query.size,
                sort: query.sort,
              })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:border-foreground"
            >
              {query.q} <X className="size-3" aria-hidden="true" />
            </Link>
          ) : null}
          {activeCategory ? (
            <Link
              href={buildCatalogHref({ q: query.q, size: query.size, sort: query.sort })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:border-foreground"
            >
              {activeCategory.name} <X className="size-3" aria-hidden="true" />
            </Link>
          ) : null}
          {query.size ? (
            <Link
              href={buildCatalogHref({ q: query.q, category: query.category, sort: query.sort })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-xs hover:border-foreground"
            >
              Size {query.size} <X className="size-3" aria-hidden="true" />
            </Link>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ShopCategoryChips({
  query,
  categories,
}: {
  query: CatalogQuery;
  categories: CategoryOption[];
}) {
  return (
    <nav aria-label="Browse categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <Link
        href="/shop"
        className={`flex min-h-11 shrink-0 items-center rounded-full border px-4 text-xs ${
          !query.category ? "border-foreground bg-foreground text-background" : "border-border"
        }`}
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
          aria-current={query.category === category.slug ? "page" : undefined}
          className={`flex min-h-11 shrink-0 items-center rounded-full border px-4 text-xs ${
            query.category === category.slug
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
