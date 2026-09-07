import * as z from "zod";
import { emailField, passwordField } from "./authValidators";

function calculateAge(dateString) {
  const dob = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

// schema and regex data
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters"),
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_.]+$/,
        "Username can only contain letters, numbers, underscores and dots",
      ),
    email: emailField,
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((data) => calculateAge(data) >= 18, "You must be at least 18 years old"),
    gender: z.string().min(1, "Gender is required"),
    password: passwordField,
    rePassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords don't match",
    path: ["rePassword"],
  });
