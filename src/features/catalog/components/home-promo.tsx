import { siteConfig } from "@/config/site.config";

export function HomePromo() {
  const ticker = [
    siteConfig.home.benefits.shipping.title,
    `${siteConfig.shipping.returnsWindowDays}-day easy returns`,
    siteConfig.home.benefits.payments.title,
    siteConfig.tagline,
  ];

  return (
    <section
      aria-label="Store benefits"
      className="benefits-marquee overflow-hidden border-y border-border bg-secondary/60"
    >
      <div className="announcement-track flex w-max items-center gap-8 py-4 text-[10px] tracking-[0.16em] uppercase sm:gap-12 sm:text-xs">
        {[0, 1, 2, 3].map((copy) => (
          <div key={copy} aria-hidden={copy > 0} className="flex items-center gap-8 sm:gap-12">
            {ticker.map((item) => (
              <span key={`${copy}-${item}`} className="flex items-center gap-8 sm:gap-12">
                <span>{item}</span>
                <span aria-hidden="true" className="text-accent">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only">{ticker.join(". ")}</p>
    </section>
  );
}
