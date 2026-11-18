"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page rendering failed", { digest: error.digest });
  }, [error.digest]);
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-3xl">Something went wrong</h1>
      <p className="text-muted-foreground">
        Please try again. Your account and order details remain private.
      </p>
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
