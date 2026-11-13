import { z } from "zod";

const stockTargetSchema = z.number().int().min(0).max(1_000_000);

export const inventoryQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  state: z.enum(["all", "low", "out"]).catch("all"),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export const stockUpdateSchema = z.object({
  variantId: z.string().cuid(),
  stock: stockTargetSchema,
  reason: z.string().trim().min(1).max(120).default("Inline inventory adjustment"),
});

export const bulkStockUpdateSchema = z.object({
  items: z
    .array(z.object({ variantId: z.string().cuid(), stock: stockTargetSchema }))
    .min(1)
    .max(100)
    .superRefine((items, context) => {
      if (new Set(items.map((item) => item.variantId)).size !== items.length) {
        context.addIssue({
          code: "custom",
          message: "Selected variants must be unique.",
        });
      }
    }),
  reason: z.string().trim().min(1).max(120).default("Bulk inventory adjustment"),
});

export const inventoryExportQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  state: z.enum(["all", "low", "out"]).catch("all"),
});

export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;

export function parseInventoryQuery(params: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return inventoryQuerySchema.parse({
    q: first(params.q),
    state: first(params.state),
    page: first(params.page),
  });
}
