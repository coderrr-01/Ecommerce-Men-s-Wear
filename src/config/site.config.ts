/**
 * Single source of truth for all brand, store and commerce defaults.
 * Components must read from this config (or the database for admin overrides)
 * instead of hardcoding text, colours, contact details or shipping rules.
 */
export const siteConfig = {
  name: "Meridian",
  shortName: "Meridian",
  legalName: "Meridian Menswear Pvt. Ltd.",
  tagline: "Modern menswear, made to last.",
  description:
    "Considered shirts, trousers and outerwear for men. Honest fabrics, precise fits and timeless design.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-IN",
  currency: "INR",
  currencySymbol: "₹",
  defaultCountry: "IN",
  timezone: "Asia/Kolkata",

  logo: {
    wordmark: "MERIDIAN",
    mark: "M",
  },

  theme: {
    background: "#fbfaf8",
    foreground: "#1c1917",
    card: "#ffffff",
    cardForeground: "#1c1917",
    popover: "#ffffff",
    popoverForeground: "#1c1917",
    primary: "#111827",
    primaryForeground: "#fafaf9",
    secondary: "#f0ece5",
    secondaryForeground: "#1c1917",
    muted: "#f1eee9",
    mutedForeground: "#78716c",
    accent: "#9a6b2f",
    accentForeground: "#fffbeb",
    destructive: "#b91c1c",
    destructiveForeground: "#fef2f2",
    border: "#e5e0d8",
    input: "#ddd7cd",
    ring: "#9a6b2f",
    radius: "0.5rem",
  },

  contact: {
    email: "care@meridian.example",
    phone: "+91 98765 43210",
    whatsapp: "+919876543210",
    hours: "Mon–Sat, 10:00–19:00 IST",
  },

  address: {
    line1: "12 Linking Road",
    line2: "Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400050",
    country: "India",
  },

  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
  ],

  shipping: {
    freeShippingThreshold: 149900,
    standardFee: 9900,
    codFee: 4900,
    estimatedDays: "3–5 business days",
    returnsWindowDays: 14,
  },

  tax: {
    label: "GST",
    rateBps: 500,
    pricesIncludeTax: true,
  },

  policies: {
    exchangeWindowDays: 14,
    returnWindowDays: 14,
    refundProcessingDays: "5–7 business days",
  },

  seo: {
    titleTemplate: "%s | Meridian",
    keywords: [
      "menswear",
      "men's shirts",
      "men's trousers",
      "men's jackets",
      "Indian menswear",
      "premium menswear",
    ],
  },

  features: {
    wishlist: true,
    reviews: true,
    coupons: true,
    guestCheckout: false,
    cod: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
