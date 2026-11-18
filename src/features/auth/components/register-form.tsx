"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/features/auth/actions/auth.actions";
import { initialAuthState } from "@/features/auth/types";

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(registerAction, initialAuthState);
  const [showPasswords, setShowPasswords] = useState(false);
  const loginHref = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1.5">
        <h1 className="font-serif text-3xl tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Faster checkout, order history and a saved wishlist.
        </p>
      </div>

      <form action={formAction} className="space-y-5" noValidate>
        {state.successMessage ? (
          <div
            role="status"
            className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent"
          >
            <p>{state.successMessage}</p>
            <Link
              href={loginHref}
              className="mt-2 inline-block font-medium underline underline-offset-4"
            >
              Sign in to continue
            </Link>
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Arjun Mehta"
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name ? (
            <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
          <p className="text-xs text-muted-foreground">
            Add the mobile used for a guest order to claim it later. This number is not verified.
          </p>
          {state.fieldErrors?.phone ? (
            <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email ? (
            <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
              aria-pressed={showPasswords}
              onClick={() => setShowPasswords((visible) => !visible)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {showPasswords ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showPasswords ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          <p className="text-xs text-muted-foreground">
            At least 10 characters, including a letter and a number. Common passwords are blocked.
          </p>
          {state.fieldErrors?.password ? (
            <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          />
          {state.fieldErrors?.confirmPassword ? (
            <p className="text-sm text-destructive">{state.fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        {state.message ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
