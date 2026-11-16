"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { ProductCardData } from "@/features/catalog/types";

export function ProductCarousel({ products }: { products: ProductCardData[] }) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(products.length > 1);

  const updateControls = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateControls);
    emblaApi.on("reInit", updateControls);
    return () => {
      emblaApi.off("select", updateControls);
      emblaApi.off("reInit", updateControls);
    };
  }, [emblaApi, updateControls]);

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          aria-label="Scroll products left"
          disabled={!canScrollPrev}
          onClick={() => emblaApi?.scrollPrev()}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          aria-label="Scroll products right"
          disabled={!canScrollNext}
          onClick={() => emblaApi?.scrollNext()}
        >
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="-ml-4 flex touch-pan-y sm:-ml-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${products.length}`}
              className="min-w-0 flex-[0_0_78%] pl-4 sm:flex-[0_0_42%] sm:pl-6 lg:flex-[0_0_30%] xl:flex-[0_0_25%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
