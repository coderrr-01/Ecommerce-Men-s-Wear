export interface AuthActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  successMessage?: string;
}

export const initialAuthState: AuthActionState = { status: "idle" };
