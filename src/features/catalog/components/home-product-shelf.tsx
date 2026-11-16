import Link from "next/link";

import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { ProductCarousel } from "@/features/catalog/components/product-carousel";
import type { ProductCardData } from "@/features/catalog/types";
import { siteConfig } from "@/config/site.config";

interface HomeProductShelfProps {
  type: "newArrivals" | "bestSellers";
  products: ProductCardData[];
}

export function HomeProductShelf({ type, products }: HomeProductShelfProps) {
  const content = siteConfig.home[type];

  return (
    <ScrollReveal>
      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {content.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                {content.title}
              </h2>
            </div>
            <Link
              href={type === "newArrivals" ? "/shop?sort=newest" : "/shop"}
              className="min-h-11 pb-1 text-xs underline underline-offset-4 hover:text-accent"
            >
              {content.linkLabel}
            </Link>
          </div>
          {products.length > 0 ? (
            <ProductCarousel products={products} />
          ) : (
            <p className="py-10 text-sm text-muted-foreground">New pieces are on their way.</p>
          )}
        </div>
      </section>
    </ScrollReveal>
  );
}
