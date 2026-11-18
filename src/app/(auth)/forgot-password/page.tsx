import Link from "next/link";

import { PasswordResetRequestForm } from "@/features/auth/components/password-reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl tracking-tight">Reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Enter your account email. If it is registered, we will send a one-time reset link.
      </p>
      <PasswordResetRequestForm />
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-foreground underline underline-offset-4"
      >
        Back to sign in
      </Link>
    </div>
  );
}
