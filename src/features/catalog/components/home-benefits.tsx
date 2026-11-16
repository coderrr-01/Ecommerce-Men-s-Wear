"use client";

import { motion } from "motion/react";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

export function HomeBenefits() {
  const { benefits } = siteConfig.home;
  const items = [
    {
      icon: Truck,
      title: benefits.shipping.title,
      note: `${benefits.shipping.notePrefix} ${formatPrice(siteConfig.shipping.freeShippingThreshold)}.`,
    },
    {
      icon: RotateCcw,
      title: `${siteConfig.shipping.returnsWindowDays}-day returns`,
      note: benefits.returns.note,
    },
    {
      icon: ShieldCheck,
      title: benefits.payments.title,
      note: benefits.payments.note,
    },
  ];

  return (
    <ScrollReveal>
      <section aria-label="Store benefits" className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-12">
          {items.map(({ icon: Icon, title, note }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="flex items-center gap-3"
            >
              <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
