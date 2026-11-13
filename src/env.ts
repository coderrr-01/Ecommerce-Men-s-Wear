import "server-only";
import { z } from "zod";

import { siteConfig } from "@/config/site.config";

/**
 * Server-side environment validation.
 *
 * Importing this module fails fast when required variables are missing.
 * Client components must never import it: use NEXT_PUBLIC_* values directly
 * (see `src/config/site.config.ts`) or pass data down from the server.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters. Run: openssl rand -base64 32"),
  AUTH_URL: z.url().optional(),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

  PAYMENT_PROVIDER: z.enum(["mock", "razorpay"]).default("mock"),
  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),

  STORAGE_PROVIDER: z.enum(["cloudinary"]).default("cloudinary"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(3).default(`${siteConfig.name} <${siteConfig.contact.email}>`),

  SMS_PROVIDER: z.enum(["console"]).default("console"),
  SMS_SENDER_ID: z.string().optional(),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  ALLOW_DEMO_SEED: z.enum(["true", "false"]).optional(),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  SEED_CUSTOMER_EMAIL: z.string().email().optional(),
  SEED_CUSTOMER_PASSWORD: z.string().min(8).optional(),
});

const rawEnv: Record<string, string | undefined> = {};
for (const [key, value] of Object.entries(process.env)) {
  rawEnv[key] = value === "" ? undefined : value;
}

const parsed = schema.safeParse(rawEnv);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
