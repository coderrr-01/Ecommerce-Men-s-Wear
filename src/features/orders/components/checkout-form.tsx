"use client";

import { useState, useTransition } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeOrderAction } from "@/features/orders/actions/order.actions";
import { checkCouponAction } from "@/features/coupons/actions/coupon.actions";
import { formatPrice } from "@/lib/utils";
import {
  checkoutSchema,
  type CheckoutFormInput,
  type CheckoutFormOutput,
} from "@/features/orders/schemas/order.schema";
import type { CheckoutDefaults } from "@/features/orders/types";

interface CheckoutFormProps {
  defaults: CheckoutDefaults;
  expectedSubtotal: number;
  idempotencyKey: string;
}

const fields = [
  { name: "addressLine", label: "Address line", autocomplete: "street-address" },
  { name: "city", label: "City", autocomplete: "address-level2" },
  { name: "state", label: "State", autocomplete: "address-level1" },
  { name: "pincode", label: "Pincode", autocomplete: "postal-code" },
] as const;

export function CheckoutForm({ defaults, expectedSubtotal, idempotencyKey }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormInput, unknown, CheckoutFormOutput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      ...defaults,
      note: "",
      idempotencyKey,
      honeypot: "",
      expectedSubtotal,
    },
  });
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponSaving, setCouponSaving] = useState<number | null>(null);

  const applyCoupon = async () => {
    const code = getValues("couponCode") ?? "";
    setCouponSaving(0);
    const result = await checkCouponAction({ code, phone: getValues("phone") });
    setCouponSaving(null);
    if (!result.success) {
      setValue("couponCode", "");
      setCouponMessage(result.error.message);
      return;
    }
    setValue("couponCode", result.data.code);
    setCouponMessage(`Coupon applied. You save ${formatPrice(result.data.discount)}.`);
  };

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      try {
        const result = await placeOrderAction({
          ...values,
          expectedSubtotal,
        });
        if (!result.success) {
          setMessage(result.error.message);
          return;
        }
        router.push(result.data.successUrl);
      } catch {
        setMessage("We could not place your order. Please try again.");
      }
    });
  });

  return (
    <CheckoutFields
      errors={errors}
      isPending={isPending}
      message={message}
      register={register}
      couponMessage={couponMessage}
      couponSaving={couponSaving !== null}
      onApplyCoupon={() => void applyCoupon()}
      onSubmit={onSubmit}
    />
  );
}

function CheckoutFields({
  errors,
  isPending,
  message,
  register,
  couponMessage,
  couponSaving,
  onApplyCoupon,
  onSubmit,
}: {
  errors: FieldErrors<CheckoutFormInput>;
  isPending: boolean;
  message: string | null;
  register: UseFormRegister<CheckoutFormInput>;
  couponMessage: string | null;
  couponSaving: boolean;
  onApplyCoupon: () => void;
  onSubmit: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input id="checkout-idempotency-key" type="hidden" {...register("idempotencyKey")} />
      <input type="hidden" {...register("expectedSubtotal", { valueAsNumber: true })} />
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="checkout-website">Leave this field empty</label>
        <input id="checkout-website" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="checkout-coupon">Coupon code (optional)</Label>
          <div className="flex gap-2">
            <Input id="checkout-coupon" autoComplete="off" {...register("couponCode")} />
            <Button type="button" variant="outline" disabled={couponSaving} onClick={onApplyCoupon}>
              {couponSaving ? "Checking..." : "Apply"}
            </Button>
          </div>
          {couponMessage ? (
            <p role="status" className="text-xs text-muted-foreground">
              {couponMessage}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="checkout-name">Full name</Label>
          <Input id="checkout-name" autoComplete="name" {...register("fullName")} />
          {errors.fullName ? (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="checkout-phone">Mobile number</Label>
          <Input
            id="checkout-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            {...register("phone")}
          />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.name === "addressLine" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
          >
            <Label htmlFor={`checkout-${field.name}`}>{field.label}</Label>
            <Input
              id={`checkout-${field.name}`}
              autoComplete={field.autocomplete}
              maxLength={field.name === "addressLine" ? 200 : 100}
              {...register(field.name)}
            />
            {errors[field.name] ? (
              <p className="text-xs text-destructive">{errors[field.name]?.message}</p>
            ) : null}
          </div>
        ))}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="checkout-note">Delivery note (optional)</Label>
          <textarea
            id="checkout-note"
            rows={3}
            maxLength={500}
            placeholder="Anything we should know?"
            {...register("note")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {errors.note ? <p className="text-xs text-destructive">{errors.note.message}</p> : null}
        </div>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        This creates an order request only. No online payment is collected.
      </p>
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Placing order…" : "Place order request"}
      </Button>
      {message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
