"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProductImageCard, type AdminProductImage } from "@/features/catalog/components/product-image-card";
import { ProductImageUploader } from "@/features/catalog/components/product-image-uploader";
import { MAX_PRODUCT_IMAGES } from "@/features/catalog/product-image.utils";
import {
  deleteProductImageAction,
  reorderProductImagesAction,
  updateProductImageAltAction,
} from "@/features/catalog/actions/product-image.actions";

export function ProductImageManager({
  productId,
  productName,
  initialImages,
  storageConfigured,
  canDeleteImages,
}: {
  productId: string;
  productName: string;
  initialImages: AdminProductImage[];
  storageConfigured: boolean;
  canDeleteImages: boolean;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  async function saveOrder(nextImages: AdminProductImage[], primaryId: string) {
    if (busy) return;
    const previous = images;
    setImages(nextImages);
    setBusy(true);
    const response = await reorderProductImagesAction({
      productId,
      imageIds: nextImages.map((image) => image.id),
      primaryImageId: primaryId,
    });
    setBusy(false);
    if (!response.success) {
      setImages(previous);
      toast.error(response.error.message);
    } else {
      router.refresh();
    }
  }

  async function saveAltText(id: string, altText: string): Promise<boolean> {
    if (!altText.trim()) {
      toast.error("Alt text cannot be empty.");
      return false;
    }
    const response = await updateProductImageAltAction({ productId, imageId: id, altText });
    if (!response.success) {
      toast.error(response.error.message);
      return false;
    }
    setImages((current) => current.map((image) => image.id === id ? { ...image, altText } : image));
    return true;
  }

  async function removeImage(id: string) {
    if (!window.confirm("Delete this product image? This also removes it from Cloudinary.")) return;
    setBusy(true);
    const response = await deleteProductImageAction({ productId, imageId: id });
    setBusy(false);
    if (!response.success) {
      toast.error(response.error.message);
      return;
    }
    const deletedPrimary = images.some((image) => image.id === id && image.isPrimary);
    setImages((current) =>
      current
        .filter((image) => image.id !== id)
        .map((image, sortOrder) => ({
          ...image,
          sortOrder,
          isPrimary: deletedPrimary ? sortOrder === 0 : image.isPrimary,
        })),
    );
    toast.success("Image deleted.");
    router.refresh();
  }

  function dropOnImage(targetId: string) {
    if (!draggedId || draggedId === targetId || busy) return;
    const next = [...images];
    const from = next.findIndex((image) => image.id === draggedId);
    const to = next.findIndex((image) => image.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    if (next.length === 0) return;
    const primaryId = next.find((image) => image.isPrimary)?.id ?? next[0].id;
    void saveOrder(next.map((image, sortOrder) => ({ ...image, sortOrder })), primaryId);
    setDraggedId(null);
  }

  function moveImage(id: string, direction: -1 | 1) {
    const index = images.findIndex((image) => image.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    const primaryId = next.find((image) => image.isPrimary)?.id ?? next[0].id;
    void saveOrder(next.map((image, sortOrder) => ({ ...image, sortOrder })), primaryId);
  }

  return (
    <section id="images" className="scroll-mt-24 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Product media</p>
          <h2 className="mt-1 font-serif text-2xl tracking-tight">Images</h2>
        </div>
        <p className="text-sm text-muted-foreground">{images.length} / {MAX_PRODUCT_IMAGES}</p>
      </header>

      {!storageConfigured && (
        <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
          Image storage is not configured. Ask an administrator to configure Cloudinary before uploading or deleting Cloudinary-backed images.
        </p>
      )}

      <ProductImageUploader
        productId={productId}
        imageCount={images.length}
        storageConfigured={storageConfigured}
        disabled={busy}
        onBusyChange={setBusy}
        onUploaded={(image) => {
          setImages((current) => [...current, image]);
          router.refresh();
        }}
      />

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <ProductImageCard
              key={image.id}
              image={image}
              isLastImage={image.sortOrder === images.length - 1}
              disabled={busy}
              canDeleteImages={canDeleteImages}
              onAltTextSave={(id, value) => saveAltText(id, value)}
              onMakePrimary={(id) => {
                const nextImages = images.map((item) => ({ ...item, isPrimary: item.id === id }));
                void saveOrder(nextImages, id);
              }}
              onDelete={(id) => void removeImage(id)}
              onMove={moveImage}
              onDragStart={setDraggedId}
              onDrop={dropOnImage}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
          No images yet. Add clear, well-lit product photography for {productName}.
        </p>
      )}
    </section>
  );
}
