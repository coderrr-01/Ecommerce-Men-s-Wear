import { ValidationError } from "@/lib/errors";

export function validateStockTarget(stock: number): void {
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 1_000_000) {
    throw new ValidationError("Stock must be a whole number between 0 and 1,000,000.");
  }
}

export function getInventoryState(stock: number, lowStockThreshold: number): "in" | "low" | "out" {
  if (stock <= 0) return "out";
  return stock <= lowStockThreshold ? "low" : "in";
}

export function toInventoryCsv(rows: {
  product: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  state: string;
}[]): string {
  const cell = (value: string | number) => {
    const text = String(value).replaceAll('"', '""');
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText}"`;
  };
  const header = ["Product", "SKU", "Size", "Color", "Stock", "Status"];
  const lines = rows.map((row) =>
    [row.product, row.sku, row.size, row.color, row.stock, row.state].map(cell).join(","),
  );
  return [header.map(cell).join(","), ...lines].join("\r\n");
}
