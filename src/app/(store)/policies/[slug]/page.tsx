import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

type PolicySlug = "shipping" | "returns" | "privacy" | "terms";
type PolicyContent = (typeof siteConfig.policies.pages)[PolicySlug];

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

function getPolicy(slug: string): PolicyContent | null {
  if (slug === "shipping" || slug === "returns" || slug === "privacy" || slug === "terms") {
    return siteConfig.policies.pages[slug];
  }
  return null;
}

function renderPolicyText(text: string): string {
  const values: Record<string, string> = {
    estimatedDays: siteConfig.shipping.estimatedDays,
    freeShippingThreshold: formatPrice(siteConfig.shipping.freeShippingThreshold),
    standardFee: formatPrice(siteConfig.shipping.standardFee),
    codFee: formatPrice(siteConfig.shipping.codFee),
    returnWindowDays: String(siteConfig.policies.returnWindowDays),
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    hours: siteConfig.contact.hours,
    currency: siteConfig.currency,
    legalName: siteConfig.legalName,
    addressLine1: siteConfig.address.line1,
    addressLine2: siteConfig.address.line2,
    city: siteConfig.address.city,
    state: siteConfig.address.state,
    postalCode: siteConfig.address.postalCode,
    country: siteConfig.address.country,
  };
  return text.replace(/\{\{([A-Za-z]+)\}\}/g, (token, key: string) => values[key] ?? token);
}

export function generateStaticParams() {
  return ["shipping", "returns", "privacy", "terms"].map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Policy not found" };
  const canonical = new URL(`/policies/${slug}`, siteConfig.url);

  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical },
    openGraph: { title: policy.title, description: policy.description, url: canonical },
    twitter: { title: policy.title, description: policy.description },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicy(slug) ?? notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Customer care</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">{policy.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{policy.description}</p>

      <p
        role="note"
        className="mt-5 rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
      >
        Draft policy — REPLACE BEFORE LAUNCH. Review this text for your business and applicable law.
      </p>

      <div className="mt-10 space-y-9">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-2xl tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                  {renderPolicyText(paragraph)}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-md border border-border bg-secondary/50 p-5 text-sm">
        <p>
          Questions?{" "}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {siteConfig.contact.email}
          </a>{" "}
          · {siteConfig.contact.phone}
        </p>
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-block text-sm underline underline-offset-4 hover:text-accent"
      >
        Back to the collection
      </Link>
    </div>
  );
}
