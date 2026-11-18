import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import { themeCss } from "@/config/theme";
import { siteConfig } from "@/config/site.config";
import { MotionProvider } from "@/components/shared/motion-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  keywords: [...siteConfig.seo.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName }],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.theme.background,
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: [siteConfig.address.line1, siteConfig.address.line2]
        .filter(Boolean)
        .join(", "),
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
  };
  return (
    <html lang={siteConfig.locale} data-scroll-behavior="smooth">
      <head>
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        <MotionProvider nonce={nonce}>{children}</MotionProvider>
      </body>
    </html>
  );
}
