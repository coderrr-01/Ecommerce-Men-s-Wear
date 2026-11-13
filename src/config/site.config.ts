/**
 * Single source of truth for all brand, store and commerce defaults.
 * Components must read from this config (or the database for admin overrides)
 * instead of hardcoding text, colours, contact details or shipping rules.
 */
const brandName = "Meridian";
const brandShortName = "Meridian";

export const siteConfig = {
  name: brandName,
  shortName: brandShortName,
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
    adminEmail: "admin@meridian.example",
    adminName: `${brandName} Admin`,
    customerEmail: "customer@meridian.example",
    customerName: "Demo Customer",
  },
} as const;

export type SiteConfig = typeof siteConfig;
