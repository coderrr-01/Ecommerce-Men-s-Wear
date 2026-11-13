import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/utils";

interface PolicySection {
  heading: string;
  body: string[];
}

interface PolicyContent {
  title: string;
  description: string;
  sections: PolicySection[];
}

const policies: Record<string, PolicyContent> = {
  shipping: {
    title: "Shipping",
    description: "Delivery timelines, charges and order tracking.",
    sections: [
      {
        heading: "Dispatch and delivery",
        body: [
          `Orders are dispatched within 1–2 business days. Standard delivery takes ${siteConfig.shipping.estimatedDays}.`,
          "You will receive tracking details by email and SMS once your parcel leaves our warehouse.",
        ],
      },
      {
        heading: "Charges",
        body: [
          `Shipping is complimentary on orders over ${formatPrice(
            siteConfig.shipping.freeShippingThreshold,
          )}. Below that, standard shipping is ${formatPrice(siteConfig.shipping.standardFee)}.`,
          `Cash on delivery, where available, carries a fee of ${formatPrice(
            siteConfig.shipping.codFee,
          )}.`,
        ],
      },
      {
        heading: "Serviceable areas",
        body: [
          "We currently deliver across India. If your postal code is not serviceable at checkout, contact our care team and we will confirm options.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns & exchanges",
    description: "How to return or exchange an unworn piece.",
    sections: [
      {
        heading: "Window",
        body: [
          `Returns and exchanges are accepted within ${siteConfig.policies.returnWindowDays} days of delivery.`,
          "Pieces must be unworn, unwashed and returned with original tags and packaging.",
        ],
      },
      {
        heading: "How to start a return",
        body: [
          `Email ${siteConfig.contact.email} with your order number and the reason for return. Our team will arrange pickup where available.`,
          "Refunds are processed to the original payment method within 5–7 business days after inspection.",
        ],
      },
      {
        heading: "Exclusions",
        body: [
          "Altered garments, innerwear and items marked final sale cannot be returned unless faulty.",
          "If a piece arrives damaged or incorrect, contact us within 48 hours and we will make it right.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    description: "What we collect, why we collect it and your choices.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "We collect the details you provide when creating an account, placing an order or contacting support: name, email, phone, delivery addresses and order history.",
          "Payment card details are handled by our payment provider and are never stored on our servers.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Your information is used to fulfil orders, provide support, prevent fraud and, where permitted, send relevant updates.",
          "We do not sell personal information.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          `You can request access, correction or deletion of your data by emailing ${siteConfig.contact.email}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms",
    description: "The terms that apply when you use this store.",
    sections: [
      {
        heading: "Orders",
        body: [
          "An order is accepted when we confirm it by email. We may cancel an order if an item is unavailable, pricing is incorrect or fraud is suspected, and any payment taken will be refunded.",
        ],
      },
      {
        heading: "Pricing",
        body: [
          `All prices are listed in ${siteConfig.currency} and include ${siteConfig.tax.label} unless stated otherwise.`,
        ],
      },
      {
        heading: "Liability",
        body: [
          "Nothing in these terms limits rights available under applicable consumer law. Our liability is limited to the value of the products purchased.",
        ],
      },
      {
        heading: "Contact",
        body: [
          `${siteConfig.legalName}, ${siteConfig.address.line1}, ${siteConfig.address.line2}, ${siteConfig.address.city} ${siteConfig.address.postalCode}. Email ${siteConfig.contact.email}.`,
        ],
      },
    ],
  },
};

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) return { title: "Policy not found" };

  return { title: policy.title, description: policy.description };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = policies[slug] ?? notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Customer care</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">{policy.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{policy.description}</p>

      <div className="mt-10 space-y-9">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-2xl tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                  {paragraph}
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
