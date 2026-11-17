export interface CheckoutInput {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  note?: string;
  idempotencyKey: string;
  honeypot: string;
  expectedSubtotal: number;
}

export interface CheckoutAddress {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: "IN";
}

export interface OrderMessageItem {
  name: string;
  productSlug: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderMessageData {
  orderNumber: string;
  whatsappToken: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
  customerNote: string | null;
  items: OrderMessageItem[];
  subtotal: number;
  discountTotal?: number;
  shippingTotal: number;
  taxTotal?: number;
  grandTotal: number;
}

export interface OrderHistoryView {
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
}

export interface OrderTimelineStep {
  status: string;
  completed: boolean;
  current: boolean;
  createdAt: Date | null;
  note: string | null;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  placedAt: Date;
  customerName: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
  items: {
    name: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMethod: string | null;
}

export interface StoredOrderMessage {
  orderNumber: string;
  whatsappToken: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: unknown;
  customerNote: string | null;
  subtotal: number;
  discountTotal?: number;
  shippingTotal: number;
  taxTotal?: number;
  grandTotal: number;
  status?: string;
  placedAt?: Date;
  stockCommittedAt?: Date | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  statusHistory?: OrderHistoryView[];
  items: {
    name: string;
    productSlug: string | null;
    size: string;
    color: string;
    quantity: number;
    price: number;
    total: number;
  }[];
}

export interface OrderPricingCartItem {
  quantity: number;
  variant: {
    id: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    isActive: boolean;
    deletedAt: Date | null;
    product: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
      deletedAt: Date | null;
      images: { url: string }[];
    };
  };
}

export interface PricedOrder {
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  items: {
    productId: string;
    productSlug: string;
    variantId: string;
    name: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    total: number;
    imageUrl: string | null;
  }[];
}

export interface CheckoutDefaults {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export type AdminOrderStatus =
  "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
