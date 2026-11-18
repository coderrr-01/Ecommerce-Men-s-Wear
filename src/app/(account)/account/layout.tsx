import Link from "next/link";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/auth.actions";
import { requireUser } from "@/features/auth/services/session.service";
import { accountNav } from "@/config/navigation";
import { fontVariables } from "@/components/shared/fonts";
import { getWishlist } from "@/features/wishlist/services/wishlist.service";
import { GuestWishlistProvider } from "@/features/wishlist/components/guest-wishlist-provider";
import { QuickViewProvider } from "@/features/catalog/components/quick-view-provider";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  const wishlist = await getWishlist(user.id);

  return (
    <div
      className={`${fontVariables} mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14`}
    >
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Account</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">{user.name ?? "Your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <GuestWishlistProvider userId={user.id} initialItems={wishlist}>
        <QuickViewProvider>
          <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <nav aria-label="Account navigation" className="h-fit">
              <ul className="flex gap-2 overflow-x-auto lg:flex-col">
                {accountNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>{children}</div>
          </div>
        </QuickViewProvider>
      </GuestWishlistProvider>
    </div>
  );
}
