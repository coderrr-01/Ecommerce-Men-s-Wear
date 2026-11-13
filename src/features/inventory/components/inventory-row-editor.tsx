"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryRow } from "@/features/inventory/types";

const stateLabels = { in: "In stock", low: "Low", out: "Out of stock" } as const;
const stateVariants = { in: "secondary", low: "accent", out: "destructive" } as const;

export function InventoryRowEditor({
  row,
  selected,
  disabled,
  onSelect,
  onSave,
}: {
  row: InventoryRow;
  selected: boolean;
  disabled: boolean;
  onSelect: (selected: boolean) => void;
  onSave: (variantId: string, stock: number) => Promise<boolean>;
}) {
  const [stock, setStock] = useState(String(row.stock));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = Number(stock);
    if (!stock.trim() || !Number.isSafeInteger(target) || target < 0 || target > 1_000_000) return;
    if (await onSave(row.id, target)) setStock(String(target));
  }

  return (
    <tr>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          aria-label={`Select ${row.sku}`}
          onChange={(event) => onSelect(event.target.checked)}
        />
      </td>
      <th scope="row" className="px-4 py-3 font-medium">
        <Link href={`/admin/products/${row.product.id}/edit`} className="hover:underline">
          {row.product.name}
        </Link>
        {!row.product.isActive && <span className="ml-2 text-xs text-muted-foreground">(Draft)</span>}
      </th>
      <td className="px-4 py-3">{row.sku}</td>
      <td className="px-4 py-3">{row.size}</td>
      <td className="px-4 py-3">{row.color}</td>
      <td className="px-4 py-3">
        <Badge variant={stateVariants[row.state]}>{stateLabels[row.state]}</Badge>
      </td>
      <td className="px-4 py-3">
        <form onSubmit={(event) => void submit(event)} className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={1_000_000}
            step={1}
            required
            value={stock}
            aria-label={`Stock quantity for ${row.sku}`}
            disabled={disabled}
            onChange={(event) => setStock(event.currentTarget.value)}
            className="h-9 w-24"
          />
          <Button type="submit" variant="outline" size="sm" disabled={disabled || stock === String(row.stock)}>
            Save
          </Button>
        </form>
      </td>
    </tr>
  );
}
