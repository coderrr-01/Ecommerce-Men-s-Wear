import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import {
  getCategoryOptions,
  getFeaturedProducts,
} from "@/features/catalog/services/catalog.service";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(4), getCategoryOptions()]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-secondary">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-xl space-y-6">
            <p className="text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              {siteConfig.hero.eyebrow}
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {siteConfig.hero.titleLines.map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h1>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              {siteConfig.hero.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={siteConfig.hero.primaryCta.href}>
                  {siteConfig.hero.primaryCta.label}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={siteConfig.hero.secondaryCta.href}>
                  {siteConfig.hero.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-md lg:aspect-[5/6]">
            <Image
              src={siteConfig.hero.imageUrl}
              alt={siteConfig.hero.imageAlt}
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 text-sm sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="font-medium">{siteConfig.home.benefits.shipping.title}</p>
            <p className="mt-1 text-muted-foreground">
              {siteConfig.home.benefits.shipping.notePrefix}{" "}
              {formatPrice(siteConfig.shipping.freeShippingThreshold)}.
            </p>
          </div>
          <div>
            <p className="font-medium">{siteConfig.shipping.returnsWindowDays}-day returns</p>
            <p className="mt-1 text-muted-foreground">{siteConfig.home.benefits.returns.note}</p>
          </div>
          <div>
            <p className="font-medium">{siteConfig.home.benefits.payments.title}</p>
            <p className="mt-1 text-muted-foreground">{siteConfig.home.benefits.payments.note}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              {siteConfig.home.categories.eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight">
              {siteConfig.home.categories.title}
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm underline underline-offset-4 hover:text-accent sm:block"
          >
            {siteConfig.home.categories.linkLabel}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-md bg-secondary"
            >
              <Image
                src={category.imageUrl ?? PRODUCT_PLACEHOLDER_IMAGE}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-serif text-xl">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                {siteConfig.home.featured.eyebrow}
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight">
                {siteConfig.home.featured.title}
              </h2>
            </div>
            <Link href="/shop" className="text-sm underline underline-offset-4 hover:text-accent">
              {siteConfig.home.featured.linkLabel}
            </Link>
          </div>
          <ProductGrid products={featured} priorityCount={2} />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-secondary">
          <Image
            src={siteConfig.home.editorial.imageUrl}
            alt={siteConfig.home.editorial.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="max-w-lg space-y-5">
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            {siteConfig.home.editorial.eyebrow}
          </p>
          <h2 className="font-serif text-4xl leading-tight tracking-tight">
            {siteConfig.home.editorial.title}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            {siteConfig.home.editorial.body}
          </p>
          <Button asChild variant="outline">
            <Link href={siteConfig.home.editorial.cta.href}>
              {siteConfig.home.editorial.cta.label}
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
