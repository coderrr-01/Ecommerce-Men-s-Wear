import { z } from "zod";

import { STOREFRONT_SORT_VALUES } from "@/config/constants";

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  size: z.string().trim().max(10).optional(),
  sort: z.enum(STOREFRONT_SORT_VALUES).catch("newest"),
  page: z.coerce.number().int().min(1).max(500).catch(1),
});

export type CatalogQueryInput = z.infer<typeof catalogQuerySchema>;

export function parseCatalogSearchParams(params: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  return catalogQuerySchema.parse({
    q: first(params.q) || undefined,
    category: first(params.category) || undefined,
    size: first(params.size) || undefined,
    sort: first(params.sort),
    page: first(params.page),
  });
}
