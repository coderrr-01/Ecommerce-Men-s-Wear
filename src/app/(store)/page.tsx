import Link from "next/link";

import { HomeBenefits } from "@/features/catalog/components/home-benefits";
import { HomeCategories } from "@/features/catalog/components/home-categories";
import { HomeEditorial } from "@/features/catalog/components/home-editorial";
import { HomeHero } from "@/features/catalog/components/home-hero";
import { HomePromo } from "@/features/catalog/components/home-promo";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import {
  getCategoryOptions,
  getFeaturedProducts,
} from "@/features/catalog/services/catalog.service";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(4), getCategoryOptions()]);

  return (
    <>
      <HomeHero />
      <HomeBenefits />
      <HomeCategories categories={categories} />
      <HomePromo />
      <section className="reveal-on-scroll bg-secondary/45 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                {siteConfig.home.featured.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                {siteConfig.home.featured.title}
              </h2>
            </div>
            <Link
              href="/shop"
              className="pb-1 text-xs underline underline-offset-4 hover:text-accent"
            >
              {siteConfig.home.featured.linkLabel}
            </Link>
          </div>
          <ProductGrid products={featured} priorityCount={2} layout="carousel" />
        </div>
      </section>
      <HomeEditorial products={featured} />
    </>
  );
}
