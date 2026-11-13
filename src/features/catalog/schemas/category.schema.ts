import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  description: z.string().trim().max(1000).nullable(),
  imageUrl: z.union([z.literal(""), z.string().url()]),
  parentId: z.union([z.literal(""), z.string().cuid()]),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
});

export type CategoryInput = z.input<typeof categorySchema>;
export type ParsedCategoryInput = z.output<typeof categorySchema>;
