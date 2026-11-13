import Link from "next/link";

import { siteConfig } from "@/config/site.config";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl tracking-tight">Reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Password reset emails are not enabled yet. Contact our care team at{" "}
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {siteConfig.contact.email}
        </a>{" "}
        and we will help you regain access.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-foreground underline underline-offset-4"
      >
        Back to sign in
      </Link>
    </div>
  );
}
