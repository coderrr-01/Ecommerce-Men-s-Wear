import { mainNav } from "@/config/navigation";
import { storeNavGroups } from "@/config/navigation";
import { getSession } from "@/features/auth/services/session.service";
import { getCart } from "@/features/cart/services/cart.service";
import { getCartOwner } from "@/features/cart/guest-session";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user;
  const owner = await getCartOwner(user?.id);
  const cart = owner ? await getCart(owner) : null;

  return (
    <SiteHeaderClient
      nav={mainNav}
      navGroups={storeNavGroups}
      cart={cart}
      user={user ? { name: user.name ?? null, role: user.role } : null}
    />
  );
}
