export interface CartActionState {
  status: "idle" | "success" | "error";
  message?: string;
  itemCount?: number;
  requiresAuth?: boolean;
  fieldErrors?: Record<string, string>;
}

export const initialCartActionState: CartActionState = { status: "idle" };

export interface CartLine {
  id: string;
  variantId: string;
  name: string;
  slug: string;
  sku: string;
  size: string;
  color: string;
  imageUrl: string;
  imageAlt: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
}

export interface CartData {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  freeShippingRemaining: number;
}
