import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/config/site.config";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

interface FormatPriceOptions {
  currency?: string;
  locale?: string;
  showDecimals?: boolean;
}

/**
 * Prices are always stored as integers in the smallest currency unit (paise).
 * Formatting only happens at the presentation boundary.
 */
export function formatPrice(
  amountInPaise: number,
  {
    currency = siteConfig.currency,
    locale = siteConfig.locale,
    showDecimals = false,
  }: FormatPriceOptions = {},
): string {
  if (!Number.isFinite(amountInPaise)) {
    throw new TypeError("formatPrice expects a finite integer amount in paise");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(Math.round(amountInPaise) / 100);
}

export function formatPriceRange(minPaise: number, maxPaise: number): string {
  if (minPaise === maxPaise) return formatPrice(minPaise);
  return `${formatPrice(minPaise)} – ${formatPrice(maxPaise)}`;
}

export function calculateDiscountPercent(
  pricePaise: number,
  compareAtPaise?: number | null,
): number {
  if (!compareAtPaise || compareAtPaise <= pricePaise) return 0;
  return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(prefix = "ORD"): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

export function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Rejects absolute URLs and protocol-relative paths to prevent open redirects. */
export function isSafeRedirectPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}
