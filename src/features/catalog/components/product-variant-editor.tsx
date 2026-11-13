"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { PRODUCT_SIZES, suggestSku } from "@/features/catalog/product.utils";
import type { ProductFormInput } from "@/features/catalog/schemas/product.schema";
import { ProductVariantRow } from "@/features/catalog/components/product-variant-row";

export function ProductVariantEditor() {
  const { control, getValues, setValue } = useFormContext<ProductFormInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldKey",
  });
  const [autoSku, setAutoSku] = useState(fields.map((field) => !field.id));
  const sizeType = useWatch({ control, name: "sizeType" });
  const productName = useWatch({ control, name: "name" });
  const sizes = PRODUCT_SIZES[sizeType];

  function updateAutoSku(index: number, size: string, color: string) {
    if (!autoSku[index]) return;
    setValue(`variants.${index}.sku`, suggestSku(getValues("name") || "PRODUCT", size, color), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function addVariant() {
    const size = sizes[0] ?? "ONE SIZE";
    const color = "Black";
    append({
      sku: suggestSku(productName || "PRODUCT", size, color),
      size,
      color,
      colorHex: "",
      price: "",
      compareAtPrice: "",
      stock: 0,
    });
    setAutoSku((current) => [...current, true]);
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">Variants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Prices are entered in {siteConfig.currency}; stock changes are recorded in inventory
            history.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus aria-hidden="true" />
          Add variant
        </Button>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <ProductVariantRow
            key={field.fieldKey}
            index={index}
            sizes={sizes}
            onSizeChange={(size) =>
              updateAutoSku(index, size, getValues(`variants.${index}.color`))
            }
            onColorChange={(color) =>
              updateAutoSku(index, getValues(`variants.${index}.size`), color)
            }
            onSkuChange={() =>
              setAutoSku((current) =>
                current.map((automatic, itemIndex) => (itemIndex === index ? false : automatic)),
              )
            }
            onRemove={() => {
              remove(index);
              setAutoSku((current) => current.filter((_, itemIndex) => itemIndex !== index));
            }}
          />
        ))}
      </div>
    </section>
  );
}
