import { z } from "zod";

import { sanitizeOrderText } from "@/features/orders/utils";

const cleanText = (minimum: number, maximum: number) =>
  z.string().transform(sanitizeOrderText).pipe(z.string().min(minimum).max(maximum));

export const checkoutSchema = z.object({
  fullName: cleanText(2, 100),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  addressLine: cleanText(5, 200),
  city: cleanText(2, 100),
  state: cleanText(2, 100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  note: z.string().transform(sanitizeOrderText).pipe(z.string().max(500)).optional(),
  idempotencyKey: z.string().uuid(),
  honeypot: z.string().max(0),
  expectedSubtotal: z.number().int().nonnegative(),
});

export type CheckoutFormInput = z.input<typeof checkoutSchema>;
export type CheckoutFormOutput = z.output<typeof checkoutSchema>;

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  });

const adminOrderFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  status: z
    .enum(["all", "PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .catch("all"),
  dateFrom: dateOnly.optional(),
  dateTo: dateOnly.optional(),
});

const validOrderDateRange = (query: { dateFrom?: string; dateTo?: string }) =>
  !query.dateFrom || !query.dateTo || query.dateFrom <= query.dateTo;

export const adminOrdersQuerySchema = adminOrderFiltersSchema
  .extend({ page: z.coerce.number().int().min(1).max(10000).catch(1) })
  .refine(validOrderDateRange, {
    path: ["dateTo"],
    message: "End date must be on or after start date.",
  });

export const adminOrderExportSchema = adminOrderFiltersSchema
  .pick({ status: true, dateFrom: true, dateTo: true })
  .refine(validOrderDateRange, {
    path: ["dateTo"],
    message: "End date must be on or after start date.",
  });

export const customerOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export const orderNumberSchema = z.string().regex(/^[A-Za-z0-9-]{1,60}$/);
export const adminOrderIdSchema = z.string().cuid();

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().transform(sanitizeOrderText).pipe(z.string().max(500)).optional(),
});

const optionalText = (limit: number) =>
  z.string().transform(sanitizeOrderText).pipe(z.string().max(limit)).optional();

export const adminOrderDetailsSchema = z.object({
  orderId: z.string().cuid(),
  internalNote: optionalText(2000),
  trackingNumber: optionalText(100),
  courierName: optionalText(100),
  trackingUrl: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      if (!value) return true;
      try {
        return new URL(value).protocol === "https:" && !/[\u0000-\u001f\s]/.test(value);
      } catch {
        return false;
      }
    }, "Tracking URL must be a valid HTTPS URL.")
    .optional(),
});

export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type AdminOrderExportQuery = z.infer<typeof adminOrderExportSchema>;
