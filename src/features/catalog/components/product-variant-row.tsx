"use client";

import { useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site.config";
import type { ProductFormInput } from "@/features/catalog/schemas/product.schema";

interface ProductVariantRowProps {
  index: number;
  sizes: string[];
  onSizeChange(size: string): void;
  onColorChange(color: string): void;
  onSkuChange(): void;
  onRemove(): void;
}

export function ProductVariantRow({
  index,
  sizes,
  onSizeChange,
  onColorChange,
  onSkuChange,
  onRemove,
}: ProductVariantRowProps) {
  const { register, formState } = useFormContext<ProductFormInput>();
  const errors = formState.errors.variants?.[index];
  const sizeRegistration = register(`variants.${index}.size`);
  const colorRegistration = register(`variants.${index}.color`);

  return (
    <fieldset className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2 xl:grid-cols-4">
      <legend className="px-1 text-xs text-muted-foreground">Variant {index + 1}</legend>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-size`}>Size</Label>
        <select
          id={`variant-${index}-size`}
          {...sizeRegistration}
          onChange={(event) => {
            sizeRegistration.onChange(event);
            onSizeChange(event.target.value);
          }}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
          aria-invalid={Boolean(errors?.size)}
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        {errors?.size ? <p className="text-xs text-danger">{errors.size.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-color`}>Colour</Label>
        <Input
          id={`variant-${index}-color`}
          {...colorRegistration}
          onChange={(event) => {
            colorRegistration.onChange(event);
            onColorChange(event.target.value);
          }}
          aria-invalid={Boolean(errors?.color)}
        />
        {errors?.color ? <p className="text-xs text-danger">{errors.color.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-colorHex`}>Colour hex</Label>
        <Input
          id={`variant-${index}-colorHex`}
          placeholder="#1f2937"
          {...register(`variants.${index}.colorHex`)}
          aria-invalid={Boolean(errors?.colorHex)}
        />
        {errors?.colorHex ? <p className="text-xs text-danger">{errors.colorHex.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-sku`}>SKU</Label>
        <Input
          id={`variant-${index}-sku`}
          {...register(`variants.${index}.sku`, { onChange: onSkuChange })}
          aria-invalid={Boolean(errors?.sku)}
        />
        {errors?.sku ? <p className="text-xs text-danger">{errors.sku.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-price`}>Price ({siteConfig.currencySymbol})</Label>
        <Input
          id={`variant-${index}-price`}
          type="number"
          min="0.01"
          step="0.01"
          {...register(`variants.${index}.price`)}
          aria-invalid={Boolean(errors?.price)}
        />
        {errors?.price ? <p className="text-xs text-danger">{errors.price.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-compareAtPrice`}>
          Compare-at ({siteConfig.currencySymbol})
        </Label>
        <Input
          id={`variant-${index}-compareAtPrice`}
          type="number"
          min="0.01"
          step="0.01"
          {...register(`variants.${index}.compareAtPrice`)}
          aria-invalid={Boolean(errors?.compareAtPrice)}
        />
        {errors?.compareAtPrice ? (
          <p className="text-xs text-danger">{errors.compareAtPrice.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`variant-${index}-stock`}>Stock</Label>
        <Input
          id={`variant-${index}-stock`}
          type="number"
          min="0"
          step="1"
          {...register(`variants.${index}.stock`, { valueAsNumber: true })}
          aria-invalid={Boolean(errors?.stock)}
        />
        {errors?.stock ? <p className="text-xs text-danger">{errors.stock.message}</p> : null}
      </div>
      <div className="flex items-end justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={`Remove variant ${index + 1}`}
          onClick={onRemove}
        >
          <Trash2 aria-hidden="true" />
          Remove
        </Button>
      </div>
    </fieldset>
  );
}
