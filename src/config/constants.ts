export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 60;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

export const STOREFRONT_SORT_VALUES = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
] as const;

export type StorefrontSort = (typeof STOREFRONT_SORT_VALUES)[number];

export const STOREFRONT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
] as const;

export const ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
} as const;

export const ROLE_LABELS = {
  CUSTOMER: "Customer",
  STAFF: "Staff",
  ADMIN: "Administrator",
} as const;

export const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder.svg";

export const ADMIN_ROLES = ["ADMIN", "STAFF"] as const;
