import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { siteConfig } from "@/config/site.config";

export default function StoreNotFound() {
  return (
    <ScrollReveal className="mx-auto flex min-h-[65svh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
      <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">404</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">This piece is out of sight.</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
        The page may have moved or is no longer available. Return to {siteConfig.shortName} and
        explore the collection.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Browse the collection</Link>
        </Button>
      </div>
    </ScrollReveal>
  );
}
