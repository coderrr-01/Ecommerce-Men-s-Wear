"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_PRODUCT_IMAGES } from "@/features/catalog/product-image.utils";
import type { AdminProductImage } from "@/features/catalog/components/product-image-card";

type UploadedImage = AdminProductImage;
type PendingImageFile = { file: File; previewUrl: string };

function parseUploadResponse(text: string): UploadedImage {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The server returned an invalid upload response.");
  }
  if (!value || typeof value !== "object" || !("success" in value)) {
    throw new Error("The server returned an invalid upload response.");
  }
  if (value.success === false && "error" in value && value.error && typeof value.error === "object" && "message" in value.error) {
    throw new Error(String(value.error.message));
  }
  if (value.success !== true || !("data" in value) || !value.data || typeof value.data !== "object") {
    throw new Error("The server returned an invalid upload response.");
  }
  const image = value.data;
  if (
    !("id" in image) || typeof image.id !== "string" ||
    !("url" in image) || typeof image.url !== "string" ||
    !("altText" in image) || typeof image.altText !== "string" ||
    !("sortOrder" in image) || typeof image.sortOrder !== "number" ||
    !("isPrimary" in image) || typeof image.isPrimary !== "boolean"
  ) {
    throw new Error("The server returned an invalid upload response.");
  }
  return {
    id: image.id,
    url: image.url,
    altText: image.altText,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
    canDelete: true,
  };
}

function uploadFile(
  productId: string,
  file: File,
  onProgress: (progress: number) => void,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `/api/admin/products/${productId}/images`);
    request.responseType = "text";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("The image could not be uploaded. Check your connection."));
    request.onload = () => {
      try {
        const image = parseUploadResponse(request.responseText);
        if (request.status < 200 || request.status >= 300) {
          throw new Error(`Image upload failed (${request.status}).`);
        }
        resolve(image);
      } catch (error) {
        reject(error);
      }
    };
    const body = new FormData();
    body.append("file", file);
    request.send(body);
  });
}

export function ProductImageUploader({
  productId,
  imageCount,
  storageConfigured,
  disabled,
  onBusyChange,
  onUploaded,
}: {
  productId: string;
  imageCount: number;
  storageConfigured: boolean;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onUploaded: (image: UploadedImage) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingImageFile[]>([]);
  const [progress, setProgress] = useState<{ name: string; value: number } | null>(null);
  const files = pendingFiles.map(({ file }) => file);

  useEffect(() => {
    return () => pendingFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
  }, [pendingFiles]);

  function chooseFiles(selected: FileList | File[]) {
    const remaining = MAX_PRODUCT_IMAGES - imageCount;
    const next = Array.from(selected).slice(0, Math.max(remaining, 0));
    if (selected.length > next.length) toast.error(`A product can have no more than ${MAX_PRODUCT_IMAGES} images.`);
    setPendingFiles(next.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })));
  }

  async function uploadSelected() {
    if (disabled || files.length === 0) return;
    onBusyChange(true);
    let uploadedCount = 0;
    for (const file of files) {
      setProgress({ name: file.name, value: 0 });
      try {
        const image = await uploadFile(productId, file, (value) => {
          setProgress({ name: file.name, value });
        });
        onUploaded(image);
        uploadedCount += 1;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Image upload failed.");
      }
    }
    setPendingFiles([]);
    setProgress(null);
    onBusyChange(false);
    if (uploadedCount > 0) toast.success(`${uploadedCount} image${uploadedCount === 1 ? "" : "s"} uploaded.`);
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.files.length) chooseFiles(event.dataTransfer.files);
      }}
      className="rounded-xl border border-dashed border-border bg-background p-5 text-center"
    >
      <p className="text-sm font-medium">Add product images</p>
      <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG or WebP · 5 MB max per file</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        aria-label="Choose product images"
        disabled={!storageConfigured || disabled || imageCount >= MAX_PRODUCT_IMAGES}
        onChange={(event) => chooseFiles(event.currentTarget.files ?? [])}
      />
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        disabled={!storageConfigured || disabled || imageCount >= MAX_PRODUCT_IMAGES}
        onClick={() => inputRef.current?.click()}
      >
        Choose files
      </Button>
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {pendingFiles.map(({ file, previewUrl }) => (
            <div key={`${file.name}:${file.lastModified}`} className="flex items-center gap-2 text-left">
              <div
                aria-hidden="true"
                className="size-12 rounded bg-cover bg-center"
                style={{ backgroundImage: `url("${previewUrl}")` }}
              />
              <span className="max-w-40 truncate text-xs">{file.name}</span>
            </div>
          ))}
          <Button type="button" disabled={!storageConfigured || disabled} onClick={() => void uploadSelected()}>
            Upload {files.length} image{files.length === 1 ? "" : "s"}
          </Button>
        </div>
      )}
      {progress && (
        <div className="mx-auto mt-4 max-w-md text-left" aria-live="polite">
          <div className="flex justify-between text-xs">
            <span className="truncate">{progress.name}</span>
            <span>{progress.value}%</span>
          </div>
          <progress className="mt-1 h-2 w-full accent-primary" max={100} value={progress.value} />
        </div>
      )}
    </div>
  );
}
