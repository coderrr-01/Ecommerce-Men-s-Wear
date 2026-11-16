import { HomeBenefits } from "@/features/catalog/components/home-benefits";
import { HomeCategories } from "@/features/catalog/components/home-categories";
import { HomeEditorial } from "@/features/catalog/components/home-editorial";
import { HomeHero } from "@/features/catalog/components/home-hero";
import { HomeLookbook } from "@/features/catalog/components/home-lookbook";
import { HomeNewsletter } from "@/features/catalog/components/home-newsletter";
import { HomePromo } from "@/features/catalog/components/home-promo";
import { HomeProductShelf } from "@/features/catalog/components/home-product-shelf";
import { HomeTestimonials } from "@/features/catalog/components/home-testimonials";
import { HomeWinterBanner } from "@/features/catalog/components/home-winter-banner";
import {
  getCategoryOptions,
  getFeaturedProducts,
  getProductList,
} from "@/features/catalog/services/catalog.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, newArrivals] = await Promise.all([
    getFeaturedProducts(8),
    getCategoryOptions(),
    getProductList({ sort: "newest", page: 1 }),
  ]);

  return (
    <>
      <HomeHero />
      <HomeBenefits />
      <HomeCategories categories={categories} />
      <HomePromo />
      <HomeProductShelf type="newArrivals" products={newArrivals.products} />
      <HomeWinterBanner />
      <HomeProductShelf type="bestSellers" products={featured} />
      <HomeLookbook />
      <HomeTestimonials />
      <HomeEditorial />
      <HomeNewsletter />
    </>
  );
}
