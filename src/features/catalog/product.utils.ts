import { ValidationError } from "@/lib/errors";

export const PRODUCT_SIZE_TYPES = ["TOPS", "BOTTOMS", "FOOTWEAR", "FREE_SIZE"] as const;
export type ProductSizeType = (typeof PRODUCT_SIZE_TYPES)[number];

export const PRODUCT_SIZES: Record<ProductSizeType, string[]> = {
  TOPS: ["S", "M", "L", "XL", "XXL"],
  BOTTOMS: ["28", "30", "32", "34", "36", "38", "40", "42"],
  FOOTWEAR: ["6", "7", "8", "9", "10", "11", "12"],
  FREE_SIZE: ["ONE SIZE"],
};

const RUPEES_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;

export function rupeesToPaise(value: string | number): number {
  const match = RUPEES_PATTERN.exec(String(value).trim());
  if (!match) throw new ValidationError("Enter a price with up to two decimal places.");
  const paise = BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  if (paise > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new ValidationError("Price is too large.");
  }
  return Number(paise);
}

export function paiseToRupees(paise: number): string {
  if (!Number.isSafeInteger(paise) || paise < 0) {
    throw new ValidationError("Stored price must be a non-negative integer in paise.");
  }
  return `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, "0")}`;
}

export function suggestSku(productName: string, size: string, color: string): string {
  return [productName, size, color]
    .map((part) =>
      part
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean)
    .join("-")
    .slice(0, 64);
}

export function assertProductSizeSet(
  sizeType: ProductSizeType,
  variants: { size: string }[],
): void {
  const allowed = new Set(PRODUCT_SIZES[sizeType]);
  const invalid = variants.find((variant) => !allowed.has(variant.size));
  if (invalid) {
    throw new ValidationError(`${invalid.size} is not valid for the selected size set.`);
  }
}
