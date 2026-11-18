import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RegisterForm } from "@/features/auth/components/register-form";
import { isSafeRedirectPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" && isSafeRedirectPath(params.redirectTo)
      ? params.redirectTo
      : undefined;

  return <RegisterForm redirectTo={redirectTo} />;
}
