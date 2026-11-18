"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeOwnPasswordAction } from "@/features/auth/actions/password-change.actions";

type PasswordChangeState = { success: boolean; error?: string };

async function submit(
  _state: PasswordChangeState,
  formData: FormData,
): Promise<PasswordChangeState> {
  return changeOwnPasswordAction(formData);
}

export function ForcePasswordChangeForm() {
  const [state, action, pending] = useActionState(submit, { success: false, error: undefined });
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Use at least 10 characters with a letter and a number.
      </p>
      <Button disabled={pending}>{pending ? "Updating…" : "Update password"}</Button>
    </form>
  );
}
