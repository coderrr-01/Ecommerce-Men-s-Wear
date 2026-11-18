import { getCoupons } from "@/features/coupons/services/coupon.service";
import { CouponManager } from "@/features/coupons/components/coupon-manager";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Coupons</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discount amounts and minimums are entered in integer paise.
        </p>
      </header>
      <CouponManager coupons={coupons} />
    </section>
  );
}
