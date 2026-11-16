import type { ProductCardData } from "@/features/catalog/types";

const STORAGE_KEY = "storefront:guest-wishlist:v1";

export interface WishlistStorage {
  read(): ProductCardData[];
  write(items: ProductCardData[]): void;
}

export interface GuestWishlistSnapshot {
  items: ProductCardData[];
  unavailable: boolean;
}

const serverSnapshot: GuestWishlistSnapshot = { items: [], unavailable: false };
const unavailableSnapshot: GuestWishlistSnapshot = { items: [], unavailable: true };
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

export const localStorageWishlistStorage: WishlistStorage = {
  read() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isProductCardData)) {
      throw new Error("Saved wishlist data is invalid.");
    }
    return parsed;
  },
  write(items) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
};

function notify() {
  for (const listener of listeners) listener();
}

function onStorageChange() {
  lastRaw = null;
  notify();
}

export const guestWishlistStore = {
  getSnapshot(): GuestWishlistSnapshot {
    if (typeof window === "undefined") return serverSnapshot;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === lastRaw) return snapshot;
      const items = localStorageWishlistStorage.read();
      lastRaw = raw;
      snapshot = { items, unavailable: false };
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
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorageChange);
    }

    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorageChange);
      }
    };
  },
  toggle(item: ProductCardData) {
    try {
      const current = this.getSnapshot();
      if (current.unavailable) throw new Error("Wishlist storage is unavailable.");
      const exists = current.items.some((saved) => saved.id === item.id);
      const items = exists
        ? current.items.filter((saved) => saved.id !== item.id)
        : [...current.items, item];
      localStorageWishlistStorage.write(items);
      lastRaw = JSON.stringify(items);
      snapshot = { items, unavailable: false };
      notify();
      return !exists;
    } catch (error) {
      lastRaw = null;
      snapshot = unavailableSnapshot;
      notify();
      throw error;
    }
  },
  clear() {
    try {
      localStorageWishlistStorage.write([]);
      lastRaw = "[]";
      snapshot = { items: [], unavailable: false };
      notify();
    } catch (error) {
      lastRaw = null;
      snapshot = unavailableSnapshot;
      notify();
      throw error;
    }
  },
};
