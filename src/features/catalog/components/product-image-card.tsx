"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AdminProductImage {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  canDelete: boolean;
}

export function ProductImageCard({
  image,
  isLastImage,
  disabled,
  canDeleteImages,
  onAltTextSave,
  onMakePrimary,
  onDelete,
  onMove,
  onDragStart,
  onDrop,
}: {
  image: AdminProductImage;
  isLastImage: boolean;
  disabled: boolean;
  canDeleteImages: boolean;
  onAltTextSave: (id: string, value: string) => Promise<boolean>;
  onMakePrimary: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}) {
  const [altText, setAltText] = useState(image.altText);

  return (
    <article
      draggable={!disabled}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", image.id);
        onDragStart(image.id);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(image.id);
      }}
      className="group space-y-3 rounded-xl border border-border bg-card p-3"
      aria-label={`Product image ${image.sortOrder + 1}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <Image
          src={image.url}
          alt={image.altText}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground">
          {image.isPrimary ? "Primary" : `Image ${image.sortOrder + 1}`}
        </span>
      </div>
      <label className="block space-y-1 text-xs font-medium text-muted-foreground">
        Alt text
        <Input
          key={`${image.id}:${image.altText}`}
          value={altText}
          maxLength={200}
          aria-label={`Alt text for image ${image.sortOrder + 1}`}
          disabled={disabled}
          onChange={(event) => setAltText(event.currentTarget.value)}
          onBlur={async () => {
            if (altText !== image.altText && !(await onAltTextSave(image.id, altText))) {
              setAltText(image.altText);
            }
          }}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled || image.sortOrder === 0} onClick={() => onMove(image.id, -1)}>
          Move earlier
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled || isLastImage} onClick={() => onMove(image.id, 1)}>
          Move later
        </Button>
        {!image.isPrimary && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onMakePrimary(image.id)}
          >
            Make primary
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={disabled || !canDeleteImages || !image.canDelete}
          title={!canDeleteImages ? "Only admins can delete product images." : !image.canDelete ? "Configure Cloudinary before deleting this image." : undefined}
          onClick={() => onDelete(image.id)}
        >
          Delete
        </Button>
      </div>
      <p className="sr-only">Drag to reorder this image.</p>
    </article>
  );
}
