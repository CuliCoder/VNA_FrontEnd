import { z } from "zod";
import { MESSAGES } from "@/constants/messages";

const { VALIDATION: V } = MESSAGES;

export const loginSchema = z.object({
  username: z.string().min(4, V.USERNAME_MIN),
  password: z.string().min(8, V.PASSWORD_MIN),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    username: z.string().min(4, V.USERNAME_MIN),
    email: z.string().email(V.EMAIL_INVALID),
    fullName: z.string().min(1, V.REQUIRED),
    enterpriseName: z.string().optional(),
    password: z.string().min(8, V.PASSWORD_MIN),
    confirmPassword: z.string().min(1, V.REQUIRED),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: V.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email(V.EMAIL_INVALID),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, V.PASSWORD_MIN),
    confirmPassword: z.string().min(1, V.REQUIRED),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: V.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });



export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
