"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { archiveCouponAction, saveCouponAction } from "@/features/coupons/actions/coupon.actions";

type CouponRow = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
};

function dateValue(value: Date | null) {
  if (!value) return "";
  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function CouponForm({ coupon }: { coupon?: CouponRow }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    coupon?.type ?? "PERCENTAGE",
  );
  const save = async (formData: FormData) => {
    setPending(true);
    const nullableNumber = (key: string) => {
      const value = String(formData.get(key) ?? "");
      return value ? Number(value) : null;
    };
    const value = Number(formData.get("value"));
    try {
      const result = await saveCouponAction({
        id: coupon?.id,
        code: String(formData.get("code")),
        type: String(formData.get("type")),
        value,
        minOrderValue: Number(formData.get("minOrderValue")),
        maxDiscount: nullableNumber("maxDiscount"),
        usageLimit: nullableNumber("usageLimit"),
        perUserLimit: nullableNumber("perUserLimit"),
        startsAt: formData.get("startsAt")
          ? new Date(String(formData.get("startsAt"))).toISOString()
          : null,
        expiresAt: formData.get("expiresAt")
          ? new Date(String(formData.get("expiresAt"))).toISOString()
          : null,
        isActive: formData.get("isActive") === "on",
      });
      setMessage(result.success ? "Coupon saved." : result.error.message);
      if (result.success) router.refresh();
    } catch {
      setMessage("We could not save this coupon. Please retry.");
    } finally {
      setPending(false);
    }
  };
  const archive = async () => {
    if (!coupon) return;
    const result = await archiveCouponAction(coupon.id);
    setMessage(result.success ? "Coupon archived." : result.error.message);
    if (result.success) router.refresh();
  };

  return (
    <form
      action={save}
      className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4"
    >
      <div>
        <Label>Code</Label>
        <Input name="code" defaultValue={coupon?.code} required maxLength={40} />
      </div>
      <div>
        <Label>Discount type</Label>
        <select
          name="type"
          value={discountType}
          onChange={(event) =>
            setDiscountType(event.target.value === "FIXED" ? "FIXED" : "PERCENTAGE")
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="PERCENTAGE">Percent</option>
          <option value="FIXED">Flat (paise)</option>
        </select>
      </div>
      <div>
        <Label>Discount value ({discountType === "PERCENTAGE" ? "%" : "paise"})</Label>
        <Input name="value" type="number" min="1" defaultValue={coupon?.value ?? 10} required />
      </div>
      <div>
        <Label>Minimum order (paise)</Label>
        <Input
          name="minOrderValue"
          type="number"
          min="0"
          defaultValue={coupon?.minOrderValue ?? 0}
          required
        />
      </div>
      <div>
        <Label>Maximum discount (paise)</Label>
        <Input name="maxDiscount" type="number" min="1" defaultValue={coupon?.maxDiscount ?? ""} />
      </div>
      <div>
        <Label>Usage limit</Label>
        <Input name="usageLimit" type="number" min="1" defaultValue={coupon?.usageLimit ?? ""} />
      </div>
      <div>
        <Label>Per customer</Label>
        <Input
          name="perUserLimit"
          type="number"
          min="1"
          defaultValue={coupon?.perUserLimit ?? ""}
        />
      </div>
      <div>
        <Label>Starts</Label>
        <Input
          name="startsAt"
          type="datetime-local"
          defaultValue={dateValue(coupon?.startsAt ?? null)}
        />
      </div>
      <div>
        <Label>Expires</Label>
        <Input
          name="expiresAt"
          type="datetime-local"
          defaultValue={dateValue(coupon?.expiresAt ?? null)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={coupon?.isActive ?? true} /> Active
      </label>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save coupon"}
        </Button>
        {coupon ? (
          <Button type="button" variant="outline" onClick={() => void archive()}>
            Archive
          </Button>
        ) : null}
      </div>
      <p role="status" className="text-sm text-muted-foreground md:col-span-4">
        {message || `${coupon?.usedCount ?? 0} uses`}
      </p>
    </form>
  );
}

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  return (
    <div className="space-y-4">
      <CouponForm />
      {coupons.map((coupon) => (
        <CouponForm key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}
