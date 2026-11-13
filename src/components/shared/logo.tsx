import Link from "next/link";

import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  textClassName?: string;
  href?: string;
}

export function Logo({ className, textClassName, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} home`}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span className="grid size-9 place-items-center rounded-sm bg-primary font-serif text-lg leading-none text-primary-foreground">
        {siteConfig.logo.mark}
      </span>
      <span
        className={cn(
          "font-serif text-xl leading-none tracking-[0.22em] text-foreground",
          textClassName,
        )}
      >
        {siteConfig.logo.wordmark}
      </span>
    </Link>
  );
}
