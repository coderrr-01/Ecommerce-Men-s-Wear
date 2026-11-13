import Image from "next/image";

import { Logo } from "@/components/shared/logo";
import { fontVariables } from "@/components/shared/fonts";
import { siteConfig } from "@/config/site.config";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main
      className={`${fontVariables} relative flex min-h-dvh flex-col justify-center overflow-hidden bg-secondary/40 px-4 py-12 lg:grid lg:grid-cols-2 lg:items-stretch lg:px-0 lg:py-0`}
    >
      <div className="absolute inset-y-0 left-0 hidden w-1/2 lg:block">
        <Image
          src={siteConfig.hero.imageUrl}
          alt={siteConfig.hero.imageAlt}
          fill
          loading="eager"
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 max-w-2xl p-12 text-white xl:p-16">
          <p className="text-[10px] tracking-[0.22em] uppercase">{siteConfig.hero.eyebrow}</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight xl:text-6xl">
            {siteConfig.hero.titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            {siteConfig.hero.description}
          </p>
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-md lg:col-start-2 lg:my-auto lg:px-6">
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
