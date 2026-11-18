import { z } from "zod";

const fitsBcryptLimit = (value: string) => new TextEncoder().encode(value).byteLength <= 72;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.");

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(72, "Password must be 72 characters or fewer.")
  .refine(fitsBcryptLimit, "Password must be 72 bytes or fewer.")
  .regex(/[a-zA-Z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .refine(
    (value) =>
      !new Set([
        "password123",
        "password1234",
        "password123!",
        "welcome123",
        "welcome2024",
        "welcome2025",
        "welcome2026",
        "qwerty12345",
        "qwerty123456",
        "admin12345",
        "admin@12345",
        "customer@12345",
        "letmein12345",
        "letmein1234",
        "iloveyou123",
        "india12345",
        "changeme123",
        "p@ssw0rd123",
      ]).has(value.toLowerCase()),
    "Choose a less common password.",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(72, "Password is too long.")
    .refine(fitsBcryptLimit, "Password is too long."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80, "Name is too long."),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^[6-9]\d{9}$/.test(value),
        "Enter a valid 10-digit Indian mobile number.",
      )
      .transform((value) => value || undefined)
      .optional(),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirm your password.")
      .max(72, "Password is too long.")
      .refine(fitsBcryptLimit, "Password is too long."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
