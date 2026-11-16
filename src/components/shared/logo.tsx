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
      <span className="grid size-10 place-items-center rounded-sm bg-primary text-primary-foreground">
        <svg viewBox="0 0 40 40" className="size-8" aria-hidden="true">
          <path
            d="M7 14 12 7h16l5 7-13 19L7 14Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m7 14 13 1 13-1M12 7l8 8 8-8M20 15v18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
      </span>
      <span
        className={cn(
          "font-serif text-xl leading-none tracking-[0.22em] text-foreground",
          "text-[13px] tracking-[0.12em] sm:text-base sm:tracking-[0.18em]",
          textClassName,
        )}
      >
        {siteConfig.logo.wordmark}
      </span>
    </Link>
  );
}
