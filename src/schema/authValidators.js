import * as z from "zod";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Shared across every auth form (Sign In, Sign Up, ...) so email/password
// rules and messages never drift out of sync between forms.
export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .regex(EMAIL_REGEX, "Enter a valid email address");

export const passwordField = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(
    PASSWORD_REGEX,
    "Password must include an uppercase letter, a lowercase letter, a number, and a special character",
  );
