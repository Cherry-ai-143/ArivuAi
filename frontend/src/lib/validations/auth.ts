import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name must not exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
    role: z.enum(["student", "teacher"]),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface PasswordRequirement {
  id: string;
  label: string;
  isMet: boolean;
}

export function getPasswordRequirements(password: string = ""): PasswordRequirement[] {
  return [
    {
      id: "min-length",
      label: "At least 8 characters",
      isMet: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "One uppercase letter",
      isMet: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter",
      isMet: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "One number",
      isMet: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "One special character",
      isMet: /[^a-zA-Z0-9]/.test(password),
    },
  ];
}
