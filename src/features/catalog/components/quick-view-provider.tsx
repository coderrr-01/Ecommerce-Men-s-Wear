"use client";

import { createContext, useCallback, useContext, useState } from "react";
import dynamic from "next/dynamic";

import type { ProductCardData } from "@/features/catalog/types";

const QuickViewModal = dynamic(
  () =>
    import("@/features/catalog/components/quick-view-modal").then(
      (module) => module.QuickViewModal,
    ),
  { ssr: false },
);

const QuickViewContext = createContext<((product: ProductCardData) => void) | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const open = useCallback((item: ProductCardData) => setProduct(item), []);

  return (
    <QuickViewContext.Provider value={open}>
      {children}
      {product ? <QuickViewModal product={product} onClose={() => setProduct(null)} /> : null}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const open = useContext(QuickViewContext);
  if (!open) throw new Error("useQuickView must be used within QuickViewProvider.");
  return open;
}
