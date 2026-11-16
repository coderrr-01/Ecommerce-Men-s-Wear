"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

import type { ProductCardData } from "@/features/catalog/types";
import { guestWishlistStore } from "@/features/wishlist/storage/guest-wishlist";

interface GuestWishlistContextValue {
  items: ProductCardData[];
  unavailable: boolean;
  toggle: (item: ProductCardData) => boolean;
  clear: () => void;
}

const GuestWishlistContext = createContext<GuestWishlistContextValue | null>(null);

export function GuestWishlistProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    guestWishlistStore.subscribe,
    guestWishlistStore.getSnapshot,
    guestWishlistStore.getServerSnapshot,
  );
  const errorNotified = useRef(false);

  useEffect(() => {
    if (snapshot.unavailable && !errorNotified.current) {
      errorNotified.current = true;
      toast.error("Your saved wishlist is unavailable in this browser.");
    }
    if (!snapshot.unavailable) errorNotified.current = false;
  }, [snapshot.unavailable]);

  const toggle = useCallback((item: ProductCardData) => {
    try {
      return guestWishlistStore.toggle(item);
    } catch {
      toast.error("This item could not be saved. Check your browser storage settings.");
      return false;
    }
  }, []);

  const clear = useCallback(() => {
    try {
      guestWishlistStore.clear();
    } catch {
      toast.error("Your wishlist could not be cleared. Check your browser storage settings.");
    }
  }, []);

  const value = useMemo(
    () => ({ items: snapshot.items, unavailable: snapshot.unavailable, toggle, clear }),
    [snapshot, toggle, clear],
  );

  return <GuestWishlistContext.Provider value={value}>{children}</GuestWishlistContext.Provider>;
}

export function useGuestWishlist() {
  const value = useContext(GuestWishlistContext);
  if (!value) throw new Error("useGuestWishlist must be used within GuestWishlistProvider.");
  return value;
}
