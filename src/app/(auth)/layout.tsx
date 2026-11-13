import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site.config";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Need help?{" "}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {siteConfig.contact.email}
          </a>
        </p>
      </div>
    </main>
  );
}
