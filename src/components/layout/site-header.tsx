import { mainNav } from "@/config/navigation";
import { getSession } from "@/features/auth/services/session.service";
import { getCartItemCount } from "@/features/cart/services/cart.service";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user;
  const cartCount = user ? await getCartItemCount(user.id) : 0;

  return (
    <SiteHeaderClient
      nav={mainNav}
      cartCount={cartCount}
      user={user ? { name: user.name ?? null, role: user.role } : null}
    />
  );
}
