"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitReviewAction } from "@/features/reviews/actions/review.actions";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await submitReviewAction(formData);
      setMessage(
        result.success ? "Thank you. Your review is awaiting moderation." : result.error.message,
      );
      if (result.success) {
        form.reset();
        router.refresh();
      }
    });
  };
  return (
    <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4 rounded-lg border p-5">
      <input type="hidden" name="productId" value={productId} />
      <div>
        <Label htmlFor="review-rating">Rating</Label>
        <select
          id="review-rating"
          name="rating"
          defaultValue="5"
          className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </div>
      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <input
          id="review-title"
          name="title"
          maxLength={120}
          className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="review-comment">Review</Label>
        <textarea
          id="review-comment"
          name="comment"
          maxLength={2000}
          rows={4}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="review-photos">Photos (optional, up to 3)</Label>
        <input
          id="review-photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-1 block w-full text-sm"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit review"}
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>
    </form>
  );
}
