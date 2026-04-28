import { z } from "zod";

/**
 * Base schemas - reusable across multiple validators
 */
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[@$!%*?&#]/,
    "Password must contain at least one special character (@$!%*?&#)",
  );

export const shardaEmailSchema = z
  .string()
  .email("Invalid email format")
  .trim()
  .toLowerCase()
  .refine((email) => {
    const domain = email.split("@")[1];
    return domain === "ug.sharda.ac.in";
  }, "Only Sharda University student emails (ug.sharda.ac.in) are allowed");

/**
 * Registration Schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must not exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, hyphens, and underscores",
      ),
    email: shardaEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: shardaEmailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: shardaEmailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  email: shardaEmailSchema,
  otp: z.string().min(1, "OTP is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Verify Email Schema
 */
export const verifyEmailSchema = z.object({
  email: shardaEmailSchema,
  otp: z.string().min(1, "OTP is required"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Edit Profile Schema
 */
export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters")
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .optional(),
  profilePic: z.instanceof(File).optional(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;

/**
 * Become Moderator Schema
 */
export const becomeModeratorSchema = z.object({
  contactNo: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Contact number must be exactly 10 digits"),
  motivation: z
    .string()
    .trim()
    .min(20, "Motivation must be at least 20 characters")
    .max(1000, "Motivation must not exceed 1000 characters"),
});

export type BecomeModeratorInput = z.infer<typeof becomeModeratorSchema>;

/**
 * Resend OTP Schema
 */
export const resendOtpSchema = z.object({
  email: shardaEmailSchema,
});

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
