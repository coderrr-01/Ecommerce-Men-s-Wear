import type { CatalogQuery } from "@/features/catalog/types";

interface CatalogHrefOptions extends Partial<Omit<CatalogQuery, "page">> {
  page?: number;
}

export function buildCatalogHref({
  q,
  category,
  size,
  sort,
  page,
}: CatalogHrefOptions = {}): string {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (size) params.set("size", size);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
