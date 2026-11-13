export type NavIcon =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "inventory"
  | "customers"
  | "settings"
  | "cart"
  | "user"
  | "heart"
  | "map-pin"
  | "package";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: NavIcon;
  disabled?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const mainNav: NavItem[] = [
  { title: "New in", href: "/shop?sort=newest" },
  { title: "Shirts", href: "/shop?category=shirts" },
  { title: "T-Shirts", href: "/shop?category=t-shirts" },
  { title: "Trousers", href: "/shop?category=trousers" },
  { title: "Outerwear", href: "/shop?category=outerwear" },
  { title: "Ethnic", href: "/shop?category=ethnic" },
];

export const footerNav: NavGroup[] = [
  {
    title: "Shop",
    items: [
      { title: "All products", href: "/shop" },
      { title: "New arrivals", href: "/shop?sort=newest" },
      { title: "Shirts", href: "/shop?category=shirts" },
      { title: "Trousers", href: "/shop?category=trousers" },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Sign in", href: "/login" },
      { title: "Create account", href: "/register" },
      { title: "Orders", href: "/account/orders" },
      { title: "Wishlist", href: "/account/wishlist" },
    ],
  },
];

export const accountNav: NavItem[] = [
  { title: "Overview", href: "/account", icon: "user" },
  { title: "Orders", href: "/account/orders", icon: "orders" },
  { title: "Addresses", href: "/account/addresses", icon: "map-pin" },
  { title: "Wishlist", href: "/account/wishlist", icon: "heart" },
];

export const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: "dashboard" },
  { title: "Products", href: "/admin/products", icon: "products" },
  { title: "Categories", href: "/admin/categories", icon: "categories" },
  { title: "Orders", href: "/admin/orders", icon: "orders" },
  { title: "Inventory", href: "/admin/inventory", icon: "inventory" },
  { title: "Customers", href: "/admin/customers", icon: "customers" },
  { title: "Settings", href: "/admin/settings", icon: "settings" },
];
