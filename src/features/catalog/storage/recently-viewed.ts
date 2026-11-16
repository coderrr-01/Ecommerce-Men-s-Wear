import type { ProductCardData } from "@/features/catalog/types";

const STORAGE_KEY = "diamond-selection:recently-viewed:v1";
const MAX_RECENT_PRODUCTS = 8;

export interface RecentlyViewedSnapshot {
  items: ProductCardData[];
  unavailable: boolean;
}

const serverSnapshot: RecentlyViewedSnapshot = { items: [], unavailable: false };
const unavailableSnapshot: RecentlyViewedSnapshot = { items: [], unavailable: true };
const listeners = new Set<() => void>();
let lastRaw: string | null = null;
let snapshot = serverSnapshot;

function isProductCardData(value: unknown): value is ProductCardData {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    (typeof item.brand === "string" || item.brand === null) &&
    typeof item.categoryName === "string" &&
    Number.isSafeInteger(item.price) &&
    (Number.isSafeInteger(item.compareAtPrice) || item.compareAtPrice === null) &&
    Number.isSafeInteger(item.discountPercent) &&
    typeof item.imageUrl === "string" &&
    typeof item.imageAlt === "string" &&
    typeof item.inStock === "boolean" &&
    typeof item.isNew === "boolean"
  );
}

export function prioritizeRecentlyViewed(
  existing: ProductCardData[],
  product: ProductCardData,
): ProductCardData[] {
  return [product, ...existing.filter((item) => item.id !== product.id)].slice(
    0,
    MAX_RECENT_PRODUCTS,
  );
}

function notify() {
  for (const listener of listeners) listener();
}

function onStorageChange() {
  lastRaw = null;
  notify();
}

export const recentlyViewedStore = {
  getSnapshot(): RecentlyViewedSnapshot {
    if (typeof window === "undefined") return serverSnapshot;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === lastRaw) return snapshot;
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || !parsed.every(isProductCardData)) {
        throw new Error("Recently viewed data is invalid.");
      }
      lastRaw = raw;
      snapshot = { items: parsed.slice(0, MAX_RECENT_PRODUCTS), unavailable: false };
      return snapshot;
    } catch {
      lastRaw = null;
      snapshot = unavailableSnapshot;
      return snapshot;
    }
  },
  getServerSnapshot() {
    return serverSnapshot;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (typeof window !== "undefined") window.addEventListener("storage", onStorageChange);
    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorageChange);
    };
  },
  record(product: ProductCardData) {
    const current = this.getSnapshot();
    if (current.unavailable) throw new Error("Recently viewed storage is unavailable.");
    const items = prioritizeRecentlyViewed(current.items, product);
    const raw = JSON.stringify(items);
    window.localStorage.setItem(STORAGE_KEY, raw);
    lastRaw = raw;
    snapshot = { items, unavailable: false };
    notify();
  },
};
