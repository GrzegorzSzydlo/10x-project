import { z } from "zod";

/**
 * Validation schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().trim().email("Wprowadź prawidłowy adres e-mail"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

/**
 * Validation schema for user registration (client-side with password confirmation).
 */
export const registerSchema = z
  .object({
    email: z.string().trim().email("Wprowadź prawidłowy adres e-mail"),
    password: z
      .string()
      .min(8, "Hasło musi zawierać co najmniej 8 znaków")
      .max(100, "Hasło może zawierać maksymalnie 100 znaków"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

/**
 * Validation schema for user registration API (server-side without password confirmation).
 */
export const registerApiSchema = z.object({
  email: z.string().trim().email("Wprowadź prawidłowy adres e-mail"),
  password: z
    .string()
    .min(8, "Hasło musi zawierać co najmniej 8 znaków")
    .max(100, "Hasło może zawierać maksymalnie 100 znaków"),
});

/**
 * Validation schema for password recovery request.
 */
export const passwordRecoverySchema = z.object({
  email: z.string().trim().email("Wprowadź prawidłowy adres e-mail"),
});

/**
 * Validation schema for password update (client-side with password confirmation).
 */
export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Hasło musi zawierać co najmniej 8 znaków")
      .max(100, "Hasło może zawierać maksymalnie 100 znaków"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

/**
 * Validation schema for password update API (server-side without password confirmation).
 */
export const updatePasswordApiSchema = z.object({
  password: z
    .string()
    .min(8, "Hasło musi zawierać co najmniej 8 znaków")
    .max(100, "Hasło może zawierać maksymalnie 100 znaków"),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type PasswordRecoveryRequest = z.infer<typeof passwordRecoverySchema>;
export type UpdatePasswordRequest = z.infer<typeof updatePasswordSchema>;
