import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export function HomePromo() {
  return (
    <section className="reveal-on-scroll bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className="text-xs tracking-[0.08em] sm:text-sm">
          {siteConfig.announcement.shipping}{" "}
          <span className="font-semibold">
            {formatPrice(siteConfig.shipping.freeShippingThreshold)}
          </span>
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs underline underline-offset-4 hover:opacity-80"
        >
          {siteConfig.home.featured.linkLabel}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
