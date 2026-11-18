"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/features/auth/actions/password-reset.actions";
import { initialAuthState } from "@/features/auth/types";

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialAuthState);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input id="reset-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Send reset link"}
      </Button>
    </form>
  );
}
