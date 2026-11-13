import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">403</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight">You don&apos;t have access</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        This area is restricted. Sign in with an authorised account or return to the store.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
