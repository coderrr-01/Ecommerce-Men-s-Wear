import { siteConfig } from "../src/config/site.config";

export interface SeedColor {
  name: string;
  hex: string;
}

export interface SeedProduct {
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  brand: string;
  fabric: string;
  fit: string;
  occasion: string;
  isFeatured: boolean;
  price: number;
  compareAtPrice?: number;
  sizes: string[];
  colors: SeedColor[];
  imageIds: string[];
}

const TOP_SIZES = ["S", "M", "L", "XL", "XXL"];
const BOTTOM_SIZES = ["30", "32", "34", "36", "38"];
const OUTER_SIZES = ["S", "M", "L", "XL"];

export const seedCategories = [
  {
    name: "Shirts",
    slug: "shirts",
    description: "Oxford, linen and poplin shirts cut for an easy, modern silhouette.",
    imageId: "1596755094514-f87e34085b2c",
  },
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Heavyweight tees, polos and henleys in breathable natural fabrics.",
    imageId: "1521572163474-6864f9cf17ab",
  },
  {
    name: "Trousers",
    slug: "trousers",
    description: "Pleated trousers, chinos and tailored bottoms with a clean break.",
    imageId: "1594938298603-c8148c4dae35",
  },
  {
    name: "Outerwear",
    slug: "outerwear",
    description: "Field jackets, bombers and overcoats built for Indian winters.",
    imageId: "1551028719-00167b16eac5",
  },
  {
    name: "Ethnic",
    slug: "ethnic",
    description: "Kurtas and Nehru jackets that pair tradition with restraint.",
    imageId: "1598033129183-c4f50c736f10",
  },
];

export const seedProducts: SeedProduct[] = [
  {
    name: "Classic Oxford Shirt",
    slug: "classic-oxford-shirt",
    categorySlug: "shirts",
    description:
      "A wardrobe anchor in brushed cotton oxford. Structured collar, mother-of-pearl buttons and a gently tapered body.",
    shortDescription: "Brushed cotton oxford with a clean, tapered fit.",
    brand: siteConfig.name,
    fabric: "100% cotton oxford",
    fit: "Regular",
    occasion: "Everyday",
    isFeatured: true,
    price: 249900,
    compareAtPrice: 299900,
    sizes: TOP_SIZES,
    colors: [
      { name: "White", hex: "#f8f7f4" },
      { name: "Sky", hex: "#a9c4d8" },
      { name: "Navy", hex: "#1f2b3a" },
    ],
    imageIds: ["1596755094514-f87e34085b2c", "1602810318383-e386cc2a3ccf"],
  },
  {
    name: "Linen Camp Shirt",
    slug: "linen-camp-shirt",
    categorySlug: "shirts",
    description:
      "Relaxed camp collar in washed European linen. A warm-weather shirt that softens with every wear.",
    shortDescription: "Washed linen with a relaxed camp collar.",
    brand: siteConfig.name,
    fabric: "100% linen",
    fit: "Relaxed",
    occasion: "Resort",
    isFeatured: true,
    price: 289900,
    sizes: TOP_SIZES,
    colors: [
      { name: "Sand", hex: "#cbb89a" },
      { name: "Olive", hex: "#68705a" },
      { name: "Ecru", hex: "#e8e1d3" },
    ],
    imageIds: ["1626497764746-6dc36546b388", "1598033129183-c4f50c736f10"],
  },
  {
    name: "Poplin Formal Shirt",
    slug: "poplin-formal-shirt",
    categorySlug: "shirts",
    description:
      "Crisp two-ply cotton poplin with a semi-cutaway collar. Cut slim through the chest and finished with a French placket.",
    shortDescription: "Two-ply poplin with a semi-cutaway collar.",
    brand: siteConfig.name,
    fabric: "Two-ply cotton poplin",
    fit: "Slim",
    occasion: "Formal",
    isFeatured: false,
    price: 269900,
    sizes: TOP_SIZES,
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Powder Blue", hex: "#b8cad9" },
    ],
    imageIds: ["1603252109303-2751441dd157", "1620012253295-c15cc3e65df4"],
  },
  {
    name: "Heavyweight Cotton Tee",
    slug: "heavyweight-cotton-tee",
    categorySlug: "t-shirts",
    description:
      "A 240 GSM compact cotton tee with a ribbed neckline. Pre-shrunk and garment-dyed for depth of colour.",
    shortDescription: "240 GSM compact cotton with a structured drape.",
    brand: siteConfig.name,
    fabric: "100% compact cotton, 240 GSM",
    fit: "Relaxed",
    occasion: "Everyday",
    isFeatured: true,
    price: 129900,
    compareAtPrice: 159900,
    sizes: TOP_SIZES,
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Stone", hex: "#b9b1a5" },
      { name: "Forest", hex: "#33463a" },
    ],
    imageIds: ["1521572163474-6864f9cf17ab", "1576566588028-4147f3842f27"],
  },
  {
    name: "Pima Cotton Polo",
    slug: "pima-cotton-polo",
    categorySlug: "t-shirts",
    description:
      "Long-staple Pima cotton knitted in a fine gauge. A clean three-button placket and ribbed collar hold their shape.",
    shortDescription: "Fine-gauge Pima cotton with a neat collar.",
    brand: siteConfig.name,
    fabric: "100% Pima cotton",
    fit: "Regular",
    occasion: "Smart casual",
    isFeatured: false,
    price: 189900,
    sizes: TOP_SIZES,
    colors: [
      { name: "Ivory", hex: "#f2ede1" },
      { name: "Navy", hex: "#202b3c" },
    ],
    imageIds: ["1610652492500-ded49ceeb378", "1622445275463-afa2ab738c34"],
  },
  {
    name: "Waffle Henley",
    slug: "waffle-henley",
    categorySlug: "t-shirts",
    description:
      "A textured waffle-knit henley in slub cotton. Layer it under a jacket or wear it on its own.",
    shortDescription: "Textured waffle knit with a three-button neckline.",
    brand: siteConfig.name,
    fabric: "100% slub cotton",
    fit: "Regular",
    occasion: "Weekend",
    isFeatured: false,
    price: 159900,
    sizes: TOP_SIZES,
    colors: [
      { name: "Rust", hex: "#8f4d32" },
      { name: "Charcoal", hex: "#3c3c3c" },
      { name: "Oat", hex: "#d6c8ae" },
    ],
    imageIds: ["1581655353564-df123a1eb820", "1618354691373-d851c5c3a990"],
  },
  {
    name: "Pleated Wool Trouser",
    slug: "pleated-wool-trouser",
    categorySlug: "trousers",
    description:
      "Single-pleat trousers in a lightweight wool blend. High rise, tapered leg and a clean finished hem.",
    shortDescription: "Single-pleat wool blend with a tapered leg.",
    brand: siteConfig.name,
    fabric: "Wool-blend twill",
    fit: "Tapered",
    occasion: "Formal",
    isFeatured: true,
    price: 349900,
    sizes: BOTTOM_SIZES,
    colors: [
      { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Camel", hex: "#b08a5a" },
    ],
    imageIds: ["1594938298603-c8148c4dae35", "1507679799987-c73779587ccf"],
  },
  {
    name: "Garment-Dyed Chino",
    slug: "garment-dyed-chino",
    categorySlug: "trousers",
    description:
      "A mid-rise chino in washed cotton twill. Garment-dyed for a lived-in tone and finished with a straight leg.",
    shortDescription: "Washed cotton twill with a straight leg.",
    brand: siteConfig.name,
    fabric: "100% cotton twill",
    fit: "Straight",
    occasion: "Everyday",
    isFeatured: false,
    price: 229900,
    compareAtPrice: 269900,
    sizes: BOTTOM_SIZES,
    colors: [
      { name: "Khaki", hex: "#b3a07b" },
      { name: "Olive", hex: "#62705a" },
      { name: "Ink", hex: "#28303a" },
    ],
    imageIds: ["1473966968600-fa801b869a1a", "1542272604-787c3835535d"],
  },
  {
    name: "Tailored Suit Trouser",
    slug: "tailored-suit-trouser",
    categorySlug: "trousers",
    description:
      "Half-lined suit trousers with a hidden extension waistband. Cut to sit cleanly over leather or suede.",
    shortDescription: "Half-lined tailoring with a hidden waistband.",
    brand: siteConfig.name,
    fabric: "Wool-blend suiting",
    fit: "Slim",
    occasion: "Occasion",
    isFeatured: false,
    price: 399900,
    sizes: BOTTOM_SIZES,
    colors: [
      { name: "Black", hex: "#161616" },
      { name: "Slate", hex: "#4f5964" },
    ],
    imageIds: ["1516257984-b1b4d707412e", "1593032465175-481ac7f401a0"],
  },
  {
    name: "Waxed Field Jacket",
    slug: "waxed-field-jacket",
    categorySlug: "outerwear",
    description:
      "A four-pocket field jacket in waxed cotton. Corduroy collar, storm flap and a lightly insulated body.",
    shortDescription: "Waxed cotton field jacket with a corduroy collar.",
    brand: siteConfig.name,
    fabric: "Waxed cotton",
    fit: "Regular",
    occasion: "Outdoor",
    isFeatured: true,
    price: 599900,
    compareAtPrice: 699900,
    sizes: OUTER_SIZES,
    colors: [
      { name: "Olive", hex: "#5a5f45" },
      { name: "Tobacco", hex: "#6f4c33" },
    ],
    imageIds: ["1551028719-00167b16eac5", "1591047139829-d91aecb6caea"],
  },
  {
    name: "Wool Overcoat",
    slug: "wool-overcoat",
    categorySlug: "outerwear",
    description:
      "A single-breasted overcoat in a brushed wool blend. Notch lapel, welt pockets and a full satin lining.",
    shortDescription: "Single-breasted brushed wool overcoat.",
    brand: siteConfig.name,
    fabric: "Wool-blend melton",
    fit: "Regular",
    occasion: "Formal",
    isFeatured: true,
    price: 799900,
    sizes: OUTER_SIZES,
    colors: [
      { name: "Camel", hex: "#b38f60" },
      { name: "Charcoal", hex: "#343434" },
    ],
    imageIds: ["1544022613-e87ca75a784a", "1608063615781-e2ef8c73d114"],
  },
  {
    name: "Quilted Bomber",
    slug: "quilted-bomber",
    categorySlug: "outerwear",
    description:
      "Lightweight quilted bomber with ribbed trims. Insulated with recycled fill and cut for layering.",
    shortDescription: "Lightly quilted bomber with ribbed trims.",
    brand: siteConfig.name,
    fabric: "Recycled nylon shell",
    fit: "Regular",
    occasion: "Weekend",
    isFeatured: false,
    price: 449900,
    sizes: OUTER_SIZES,
    colors: [
      { name: "Black", hex: "#141414" },
      { name: "Bottle", hex: "#2f4637" },
    ],
    imageIds: ["1592878940526-0214b0f374f6", "1551028719-00167b16eac5"],
  },
  {
    name: "Handloom Cotton Kurta",
    slug: "handloom-cotton-kurta",
    categorySlug: "ethnic",
    description:
      "A straight kurta in handloom cotton with a mandarin collar and side vents. Finished with a concealed placket.",
    shortDescription: "Handloom cotton kurta with a mandarin collar.",
    brand: siteConfig.name,
    fabric: "Handloom cotton",
    fit: "Straight",
    occasion: "Festive",
    isFeatured: true,
    price: 249900,
    sizes: TOP_SIZES,
    colors: [
      { name: "Ivory", hex: "#efe8d9" },
      { name: "Indigo", hex: "#2c3a56" },
      { name: "Sage", hex: "#8a9a84" },
    ],
    imageIds: ["1598033129183-c4f50c736f10", "1600091166971-7f9faad6c1e2"],
  },
  {
    name: "Nehru Jacket",
    slug: "nehru-jacket",
    categorySlug: "ethnic",
    description:
      "A structured Nehru jacket in silk-blend jacquard. Five-button front and a clean, collarless neckline.",
    shortDescription: "Silk-blend jacquard with a five-button front.",
    brand: siteConfig.name,
    fabric: "Silk-blend jacquard",
    fit: "Slim",
    occasion: "Festive",
    isFeatured: false,
    price: 399900,
    sizes: OUTER_SIZES,
    colors: [
      { name: "Wine", hex: "#5b2430" },
      { name: "Midnight", hex: "#1c2438" },
    ],
    imageIds: ["1617137968427-85924c800a22", "1594938298603-c8148c4dae35"],
  },
  {
    name: "Kurta and Churidar Set",
    slug: "kurta-churidar-set",
    categorySlug: "ethnic",
    description:
      "A coordinated kurta and churidar set in cotton-silk. Subtle sheen, tonal stitching and a relaxed drape.",
    shortDescription: "Cotton-silk kurta with matching churidar.",
    brand: siteConfig.name,
    fabric: "Cotton-silk blend",
    fit: "Regular",
    occasion: "Wedding",
    isFeatured: true,
    price: 549900,
    compareAtPrice: 649900,
    sizes: TOP_SIZES,
    colors: [
      { name: "Sand", hex: "#d8c6a8" },
      { name: "Teal", hex: "#2f6262" },
    ],
    imageIds: ["1620012253295-c15cc3e65df4", "1583391733956-3750e0ff4e8b"],
  },
];

export const seedSizeGuides = [
  {
    name: "Tops & Shirts",
    slug: "tops-and-shirts",
    categorySlug: "shirts",
    content: {
      columns: ["Size", "Chest (in)", "Waist (in)", "Length (in)"],
      rows: [
        { size: "S", chest: 38, waist: 36, length: 28 },
        { size: "M", chest: 40, waist: 38, length: 29 },
        { size: "L", chest: 42, waist: 40, length: 30 },
        { size: "XL", chest: 44, waist: 42, length: 31 },
        { size: "XXL", chest: 46, waist: 44, length: 32 },
      ],
    },
  },
  {
    name: "Trousers",
    slug: "trousers-guide",
    categorySlug: "trousers",
    content: {
      columns: ["Size", "Waist (in)", "Inseam (in)", "Rise (in)"],
      rows: [
        { size: "30", waist: 30, inseam: 30, rise: 10.5 },
        { size: "32", waist: 32, inseam: 30.5, rise: 10.75 },
        { size: "34", waist: 34, inseam: 31, rise: 11 },
        { size: "36", waist: 36, inseam: 31, rise: 11.25 },
        { size: "38", waist: 38, inseam: 31, rise: 11.5 },
      ],
    },
  },
  {
    name: "Outerwear",
    slug: "outerwear-guide",
    categorySlug: "outerwear",
    content: {
      columns: ["Size", "Chest (in)", "Shoulder (in)", "Sleeve (in)"],
      rows: [
        { size: "S", chest: 40, shoulder: 17.5, sleeve: 24 },
        { size: "M", chest: 42, shoulder: 18, sleeve: 24.5 },
        { size: "L", chest: 44, shoulder: 18.5, sleeve: 25 },
        { size: "XL", chest: 46, shoulder: 19, sleeve: 25.5 },
      ],
    },
  },
];
