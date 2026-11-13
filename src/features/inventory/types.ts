export interface InventoryRow {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  isActive: boolean;
  state: "in" | "low" | "out";
  product: { id: string; name: string; isActive: boolean };
}
