import Link from "next/link";

import { PasswordResetForm } from "@/features/auth/components/password-reset-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const safeToken = typeof token === "string" && /^[A-Za-z0-9_-]{40,60}$/.test(token) ? token : "";
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-3xl tracking-tight">Choose a new password</h1>
      {safeToken ? (
        <PasswordResetForm token={safeToken} />
      ) : (
        <p className="mt-3 text-sm text-destructive">This reset link is invalid or expired.</p>
      )}
      <Link href="/login" className="mt-6 inline-block text-sm underline underline-offset-4">
        Back to sign in
      </Link>
    </div>
  );
}
