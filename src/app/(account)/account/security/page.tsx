import { ForcePasswordChangeForm } from "@/features/auth/components/force-password-change-form";

export const dynamic = "force-dynamic";

export default function AccountSecurityPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-3xl">Update your password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Choose a new password. You will need to sign in again after it is changed.
      </p>
      <ForcePasswordChangeForm />
    </section>
  );
}
