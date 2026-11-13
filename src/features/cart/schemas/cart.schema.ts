import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().trim().min(1, "Select a size and colour."),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(10, "Maximum quantity per item is 10."),
});
