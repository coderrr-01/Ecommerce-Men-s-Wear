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
  { title: "Shirts", href: "/shop?category=shirts" },
  { title: "T-Shirts", href: "/shop?category=t-shirts" },
  { title: "Collar T-Shirts", href: "/shop?category=collar-t-shirts" },
  { title: "Night Wear T-Shirts", href: "/shop?category=night-wear-t-shirts" },
  { title: "Baggy Jeans", href: "/shop?category=baggy-jeans" },
  { title: "Formal Pants", href: "/shop?category=formal-pants" },
  { title: "Trousers", href: "/shop?category=trousers" },
  { title: "Shorts", href: "/shop?category=shorts" },
  { title: "Sarong (Lungi)", href: "/shop?category=sarong-lungi" },
  { title: "Winter Wear", href: "/shop?category=winter-wear" },
  { title: "Contact", href: "/contact" },
  { title: "Socks", href: "/shop?category=socks" },
  { title: "Gloves", href: "/shop?category=gloves" },
  { title: "Topis (Caps)", href: "/shop?category=topis-caps" },
];

export const storeNavGroups: NavGroup[] = [
  {
    title: "Topwear",
    items: [
      { title: "Shirts", href: "/shop?category=shirts" },
      { title: "T-Shirts", href: "/shop?category=t-shirts" },
      { title: "Collar T-Shirts", href: "/shop?category=collar-t-shirts" },
    ],
  },
  {
    title: "Bottomwear",
    items: [
      { title: "Baggy Jeans", href: "/shop?category=baggy-jeans" },
      { title: "Formal Pants", href: "/shop?category=formal-pants" },
      { title: "Trousers", href: "/shop?category=trousers" },
      { title: "Shorts", href: "/shop?category=shorts" },
    ],
  },
  {
    title: "Nightwear & Traditional",
    items: [
      { title: "Night Wear T-Shirts", href: "/shop?category=night-wear-t-shirts" },
      { title: "Sarong (Lungi)", href: "/shop?category=sarong-lungi" },
    ],
  },
  {
    title: "Winter Wear",
    items: [
      { title: "Winter Wear", href: "/shop?category=winter-wear" },
      { title: "Socks", href: "/shop?category=socks" },
      { title: "Gloves", href: "/shop?category=gloves" },
      { title: "Topis (Caps)", href: "/shop?category=topis-caps" },
    ],
  },
];

export const footerNav: NavGroup[] = [
  {
    title: "Shop",
    items: [
      { title: "All products", href: "/shop" },
      { title: "New arrivals", href: "/shop?sort=newest" },
      { title: "Shirts", href: "/shop?category=shirts" },
      { title: "Trousers", href: "/shop?category=trousers" },
      { title: "Winter Wear", href: "/shop?category=winter-wear" },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Sign in", href: "/login" },
      { title: "Create account", href: "/register" },
      { title: "Orders", href: "/account/orders" },
      { title: "Wishlist", href: "/wishlist" },
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
  { title: "Coupons", href: "/admin/coupons", icon: "settings" },
  { title: "Returns", href: "/admin/returns", icon: "orders" },
  { title: "Reviews", href: "/admin/reviews", icon: "products" },
  { title: "Messages", href: "/admin/messages", icon: "customers" },
  { title: "Settings", href: "/admin/settings", icon: "settings" },
];
