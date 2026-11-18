import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/features/auth/components/login-form";
import { isSafeRedirectPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string | string[];
    registered?: string | string[];
    passwordChanged?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" && isSafeRedirectPath(params.redirectTo)
      ? params.redirectTo
      : undefined;

  return (
    <LoginForm
      redirectTo={redirectTo}
      registered={params.registered === "1"}
      passwordChanged={params.passwordChanged === "1"}
    />
  );
}
