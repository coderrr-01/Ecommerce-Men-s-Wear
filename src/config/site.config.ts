/**
 * Single source of truth for all brand, store and commerce defaults.
 * Components must read from this config (or the database for admin overrides)
 * instead of hardcoding text, colours, contact details or shipping rules.
 */
const brandName = "Diamond Selection";
const brandShortName = "Diamond Selection";

export const siteConfig = {
  name: brandName,
  shortName: brandShortName,
  legalName: "Diamond Selection",
  tagline: "Style that shines.",
  description:
    "Considered menswear for men. Distinctive pieces, confident fits and everyday comfort.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-IN",
  currency: "INR",
  currencySymbol: "₹",
  defaultCountry: "IN",
  timezone: "Asia/Kolkata",

  logo: {
    wordmark: brandName.toUpperCase(),
  },

  theme: {
    background: "#f7f9fc",
    foreground: "#101827",
    card: "#ffffff",
    cardForeground: "#101827",
    popover: "#ffffff",
    popoverForeground: "#101827",
    primary: "#101827",
    primaryForeground: "#f7f9fc",
    secondary: "#edf1f6",
    secondaryForeground: "#182334",
    muted: "#edf1f6",
    mutedForeground: "#4f5d6d",
    accent: "#79571f",
    accentForeground: "#ffffff",
    destructive: "#b91c1c",
    destructiveForeground: "#fef2f2",
    border: "#d7dde5",
    input: "#cfd6e0",
    ring: "#79571f",
    radius: "0.5rem",
  },

  contact: {
    email: "care@diamondselection.example",
    phone: "+91 00000 00000",
    whatsapp: "+910000000000",
    hours: "Mon–Sat, 10:00–19:00 IST",
  },

  address: {
    line1: "Address line 1",
    line2: "Address line 2",
    city: "City",
    state: "State",
    postalCode: "000000",
    country: "India",
  },

  social: [
    { label: "Instagram", href: "https://instagram.com/diamondselection" },
    { label: "Facebook", href: "https://facebook.com/diamondselection" },
    { label: "Pinterest", href: "https://pinterest.com/diamondselection" },
  ],

  announcement: {
    shipping: "Complimentary shipping on orders over",
  },

  hero: {
    eyebrow: "Autumn / Winter 2026",
    titleLines: ["Modern menswear,", "made to last."],
    description:
      "Honest fabrics, precise fits and pieces designed to move from workday to weekend without compromise.",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Tailored menswear in neutral tones",
    primaryCta: { label: "Shop new arrivals", href: "/shop?sort=newest" },
    secondaryCta: { label: "Explore outerwear", href: "/shop?category=outerwear" },
  },

  home: {
    benefits: {
      shipping: {
        title: "Complimentary shipping",
        notePrefix: "On orders over",
      },
      returns: {
        note: "Easy exchanges on unworn pieces.",
      },
      payments: {
        title: "Secure payments",
        note: "Encrypted checkout and trusted payment partners.",
      },
    },
    categories: {
      eyebrow: "Shop by category",
      title: "Build the wardrobe",
      linkLabel: "View everything",
    },
    featured: {
      eyebrow: "Considered essentials",
      title: "Featured pieces",
      linkLabel: "Shop all",
    },
    editorial: {
      eyebrow: `The ${brandName} standard`,
      title: "Fewer, better pieces.",
      body: "We work with a small number of mills and makers, choosing fabrics for how they feel, drape and age. Every seam is considered. Every fit is tested. The result is clothing that earns its place in your wardrobe season after season.",
      imageUrl:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85",
      imageAlt: "Detail of a tailored cotton shirt",
      cta: { label: "Explore shirts", href: "/shop?category=shirts" },
    },
  },

  footer: {
    contactHeading: "Contact",
    rightsNote: "All rights reserved.",
    policyLinks: [
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns & exchanges", href: "/policies/returns" },
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
    ],
  },

  shipping: {
    freeShippingThreshold: 149900,
    standardFee: 9900,
    codFee: 4900,
    estimatedDays: "3–5 business days",
    returnsWindowDays: 14,
  },

  inventory: {
    lowStockThreshold: 5,
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
    titleTemplate: `%s | ${brandName}`,
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

  seed: {
    adminEmail: "admin@diamondselection.example",
    adminName: `${brandName} Admin`,
    customerEmail: "customer@diamondselection.example",
    customerName: "Demo Customer",
  },
} as const;

export type SiteConfig = typeof siteConfig;
