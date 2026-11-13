import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export function HomeBenefits() {
  const { benefits } = siteConfig.home;

  return (
    <section aria-label="Store benefits" className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <Truck className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium">{benefits.shipping.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {benefits.shipping.notePrefix}{" "}
              {formatPrice(siteConfig.shipping.freeShippingThreshold)}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium">
              {siteConfig.shipping.returnsWindowDays}-day returns
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{benefits.returns.note}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium">{benefits.payments.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{benefits.payments.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
