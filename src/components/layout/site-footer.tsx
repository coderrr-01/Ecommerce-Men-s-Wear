import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site.config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/30">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12 lg:py-16">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {siteConfig.social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {footerNav.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold tracking-[0.18em] uppercase">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] uppercase">
            {siteConfig.footer.contactHeading}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-foreground">
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="hover:text-foreground"
              >
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>{siteConfig.contact.hours}</li>
            <li>
              {siteConfig.address.line1}, {siteConfig.address.line2}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.postalCode}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. {siteConfig.footer.rightsNote}
          </p>
          <div className="flex flex-wrap gap-5">
            {siteConfig.footer.policyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
