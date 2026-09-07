import * as z from "zod";
import { emailField, passwordField } from "./authValidators";

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});
