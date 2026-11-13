import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductCardData } from "@/features/catalog/types";
import { siteConfig } from "@/config/site.config";

export function HomeEditorial({ products }: { products: ProductCardData[] }) {
  return (
    <section className="reveal-on-scroll mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-8 sm:grid-cols-2">
        {products.slice(0, 2).map((product, index) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className={`group relative block overflow-hidden bg-secondary ${
              index === 1 ? "aspect-[4/5] sm:mt-20" : "aspect-[4/5]"
            }`}
          >
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <span className="absolute right-5 bottom-5 left-5 flex items-end justify-between text-white">
              <span>
                <span className="block text-[10px] tracking-[0.18em] uppercase">
                  {siteConfig.home.editorial.eyebrow}
                </span>
                <span className="mt-2 block font-serif text-2xl">{product.name}</span>
              </span>
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 grid items-center gap-8 border-t border-border pt-12 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div className="max-w-2xl">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {siteConfig.home.editorial.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            {siteConfig.home.editorial.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {siteConfig.home.editorial.body}
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href={siteConfig.home.editorial.cta.href}>
            {siteConfig.home.editorial.cta.label}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
