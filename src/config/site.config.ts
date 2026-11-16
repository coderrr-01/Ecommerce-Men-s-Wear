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

  intro: {
    enabled: true,
    brandWord: "DIAMOND SELECTION",
    counterEnabled: true,
    rotationRangeDeg: 10,
    playOnceHours: 24,
    images: [
      {
        src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=720&q=75",
        alt: "Tailored menswear in neutral tones",
      },
      {
        src: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=720&q=75",
        alt: "A crisp shirt styled for a contemporary menswear look",
      },
      {
        src: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=720&q=75",
        alt: "A winter-ready menswear look in rich neutral layers",
      },
      {
        src: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=720&q=75",
        alt: "Casual menswear styled with easy layers",
      },
      {
        src: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=720&q=75",
        alt: "A crisp cotton shirt with tailored details",
      },
      {
        src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=720&q=75",
        alt: "Relaxed cotton T-shirt for an off-duty look",
      },
    ],
    durations: {
      seedMs: 500,
      buildMs: 2300,
      cardEnterMs: 600,
      cardStaggerMs: 300,
      letterEnterMs: 600,
      letterStaggerMs: 85,
      glitchMs: 100,
      counterMs: 3000,
      exitMs: 450,
      curtainMs: 800,
      handoffMs: 450,
      reducedMotionMs: 300,
      preloadTimeoutMs: 3000,
      failsafeMs: 5500,
    },
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
    secondaryCta: { label: "Explore shirts", href: "/shop?category=shirts" },
    slides: [
      {
        eyebrow: `The ${brandName} edit`,
        titleLines: ["Style that", "shines."],
        description: "Everyday menswear with considered details and a confident point of view.",
        imageUrl:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1800&q=85",
        imageAlt: "Modern menswear styled in deep neutral tones",
        primaryCta: { label: "Shop new arrivals", href: "/shop?sort=newest" },
        secondaryCta: { label: "Explore shirts", href: "/shop?category=shirts" },
      },
      {
        eyebrow: "Made for every day",
        titleLines: ["Good fit.", "Good feeling."],
        description: "Comfort-first essentials, chosen to work hard in your wardrobe.",
        imageUrl:
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1800&q=85",
        imageAlt: "A crisp shirt styled for a contemporary menswear look",
        primaryCta: { label: "Shop shirts", href: "/shop?category=shirts" },
        secondaryCta: { label: "Browse everything", href: "/shop" },
      },
      {
        eyebrow: "The winter collection",
        titleLines: ["Layer up.", "Step out."],
        description: "Easy layers and thoughtful essentials for cooler days.",
        imageUrl:
          "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1800&q=85",
        imageAlt: "A winter-ready menswear look in rich neutral layers",
        primaryCta: { label: "Explore winter wear", href: "/shop?category=winter-wear" },
        secondaryCta: { label: "Shop all", href: "/shop" },
      },
    ],
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
    newArrivals: {
      eyebrow: "Just landed",
      title: "New arrivals",
      linkLabel: "Shop new in",
    },
    bestSellers: {
      eyebrow: "Most-loved picks",
      title: "Best sellers",
      linkLabel: "See the collection",
    },
    winterCollection: {
      eyebrow: "The winter collection",
      title: "Layer up. Step out.",
      body: "Easy layers and thoughtful essentials made for cooler days.",
      imageUrl:
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1500&q=85",
      imageAlt: "Layered winter menswear in neutral shades",
      cta: { label: "Explore winter wear", href: "/shop?category=winter-wear" },
    },
    lookbook: {
      eyebrow: "A little inspiration",
      title: "The lookbook",
      items: [
        {
          title: "Everyday layers",
          imageUrl:
            "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80",
          imageAlt: "Casual menswear styled with easy layers",
          href: "/shop",
        },
        {
          title: "The crisp shirt",
          imageUrl:
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80",
          imageAlt: "A crisp cotton shirt with tailored details",
          href: "/shop?category=shirts",
        },
        {
          title: "Off-duty ease",
          imageUrl:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
          imageAlt: "Relaxed cotton T-shirt for an off-duty look",
          href: "/shop?category=t-shirts",
        },
        {
          title: "Made to move",
          imageUrl:
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
          imageAlt: "Modern menswear with a clean, easy silhouette",
          href: "/shop?category=trousers",
        },
      ],
    },
    testimonials: {
      eyebrow: "Customer stories",
      title: "Good words, good wear.",
      items: [
        {
          quote: "Sample testimonial — replace with a verified customer story.",
          author: "Customer story placeholder",
          detail: "Sample content",
        },
        {
          quote: "Sample testimonial — replace with a verified customer story.",
          author: "Customer story placeholder",
          detail: "Sample content",
        },
        {
          quote: "Sample testimonial — replace with a verified customer story.",
          author: "Customer story placeholder",
          detail: "Sample content",
        },
      ],
    },
    newsletter: {
      eyebrow: "A note from us",
      title: "Good things, occasionally.",
      description: "New arrivals, thoughtful edits and first looks at what is coming next.",
      disabledLabel: "Newsletter sign-up coming soon",
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
