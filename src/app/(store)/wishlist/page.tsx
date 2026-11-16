import type { Metadata } from "next";

import { GuestWishlistPage } from "@/features/wishlist/components/guest-wishlist-page";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Wishlist",
  description: `Your saved ${siteConfig.name} pieces.`,
};

export default function WishlistRoute() {
  return <GuestWishlistPage />;
}
