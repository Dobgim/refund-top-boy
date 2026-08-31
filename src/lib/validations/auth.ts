import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

/** Step one of registration: who you are and how you sign in. */
export const registerCredentialsSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
    email: z.email("Enter a valid email address").trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

/** Step two: the profile details shown around the product. */
export const registerProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Usernames are at least 3 characters")
    .max(20, "Usernames are at most 20 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Start with a letter, then letters, numbers or underscores only",
    ),
  gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say"], {
    message: "Choose an option",
  }),
  country: z.string().trim().min(2, "Select your country"),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number")
    // Digits only once the country code and any trunk zero are stripped.
    .refine((value) => value.replace(/[^\d]/g, "").replace(/^0+/, "").length >= 6, {
      message: "That number looks too short",
    })
    .refine((value) => value.replace(/[^\d]/g, "").length <= 15, {
      message: "That number looks too long",
    }),
  acceptTerms: z.literal(true, { message: "You must accept the terms to continue" }),
});

export type RegisterProfile = z.infer<typeof registerProfileSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(80, "Name is too long"),
    email: z.email("Enter a valid email address").trim().toLowerCase(),
    country: z.string().trim().min(2, "Select your country"),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
