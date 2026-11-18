"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

import type { ProductCardData } from "@/features/catalog/types";
import { guestWishlistStore } from "@/features/wishlist/storage/guest-wishlist";
import {
  clearWishlistAction,
  mergeWishlistAction,
  toggleWishlistAction,
} from "@/features/wishlist/actions/wishlist.actions";

interface GuestWishlistContextValue {
  items: ProductCardData[];
  unavailable: boolean;
  toggle: (item: ProductCardData) => boolean;
  clear: () => void;
}

const GuestWishlistContext = createContext<GuestWishlistContextValue | null>(null);

export function GuestWishlistProvider({
  children,
  userId = null,
  initialItems = [],
}: {
  children: React.ReactNode;
  userId?: string | null;
  initialItems?: ProductCardData[];
}) {
  const snapshot = useSyncExternalStore(
    guestWishlistStore.subscribe,
    guestWishlistStore.getSnapshot,
    guestWishlistStore.getServerSnapshot,
  );
  const [savedItems, setSavedItems] = useState(initialItems);
  const mergedUser = useRef<string | null>(null);
  const errorNotified = useRef(false);

  useEffect(() => {
    if (!userId || mergedUser.current === userId) return;
    mergedUser.current = userId;
    const guestIds = guestWishlistStore.getSnapshot().items.map((item) => item.id);
    void mergeWishlistAction(guestIds).then((result) => {
      if (!result.success) {
        mergedUser.current = null;
        toast.error(result.error.message);
        return;
      }
      setSavedItems(result.data);
      if (guestIds.length) {
        try {
          guestWishlistStore.clear();
        } catch {
          toast.error(
            "Your saved items were merged, but this browser could not clear its guest list.",
          );
        }
      }
    });
  }, [userId]);

  useEffect(() => {
    if (snapshot.unavailable && !errorNotified.current) {
      errorNotified.current = true;
      toast.error("Your saved wishlist is unavailable in this browser.");
    }
    if (!snapshot.unavailable) errorNotified.current = false;
  }, [snapshot.unavailable]);

  const toggle = useCallback(
    (item: ProductCardData) => {
      if (userId) {
        const previous = savedItems;
        const exists = previous.some((saved) => saved.id === item.id);
        setSavedItems(
          exists ? previous.filter((saved) => saved.id !== item.id) : [item, ...previous],
        );
        void toggleWishlistAction(item.id).then((result) => {
          if (!result.success) {
            setSavedItems(previous);
            toast.error(result.error.message);
            return;
          }
          setSavedItems((current) =>
            result.data.saved
              ? current.some((saved) => saved.id === item.id)
                ? current
                : [item, ...current]
              : current.filter((saved) => saved.id !== item.id),
          );
        });
        return !exists;
      }
      try {
        return guestWishlistStore.toggle(item);
      } catch {
        toast.error("This item could not be saved. Check your browser storage settings.");
        return false;
      }
    },
    [savedItems, userId],
  );

  const clear = useCallback(() => {
    if (userId) {
      void clearWishlistAction().then((result) => {
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        setSavedItems([]);
      });
      return;
    }
    try {
      guestWishlistStore.clear();
    } catch {
      toast.error("Your wishlist could not be cleared. Check your browser storage settings.");
    }
  }, [userId]);

  const items = userId ? savedItems : snapshot.items;
  const unavailable = userId ? false : snapshot.unavailable;
  const value = useMemo(
    () => ({ items, unavailable, toggle, clear }),
    [items, unavailable, toggle, clear],
  );

  return <GuestWishlistContext.Provider value={value}>{children}</GuestWishlistContext.Provider>;
}

export function useGuestWishlist() {
  const value = useContext(GuestWishlistContext);
  if (!value) throw new Error("useGuestWishlist must be used within GuestWishlistProvider.");
  return value;
}
