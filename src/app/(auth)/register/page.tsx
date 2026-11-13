import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RegisterForm } from "@/features/auth/components/register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return <RegisterForm />;
}
