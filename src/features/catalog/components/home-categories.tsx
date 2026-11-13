import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { CategoryOption } from "@/features/catalog/types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/config/constants";
import { siteConfig } from "@/config/site.config";

export function HomeCategories({ categories }: { categories: CategoryOption[] }) {
  return (
    <section
      id="categories"
      className="reveal-on-scroll mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            {siteConfig.home.categories.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            {siteConfig.home.categories.title}
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-2 pb-1 text-xs underline underline-offset-4 hover:text-accent sm:inline-flex"
        >
          {siteConfig.home.categories.linkLabel}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-[4/5] overflow-hidden bg-secondary"
          >
            <Image
              src={category.imageUrl ?? PRODUCT_PLACEHOLDER_IMAGE}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white sm:p-5">
              <h3 className="font-serif text-xl sm:text-2xl">{category.name}</h3>
              <ArrowUpRight
                className="size-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
