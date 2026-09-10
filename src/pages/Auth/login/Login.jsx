import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../../schema/loginSchema";
import { loginData } from "../../../services/loginservices";
import { UserContext } from "./../../../context/UserContext";
import { AuthContext } from "../../../context/AuthContext";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import FieldError from "../../../components/form/FieldError";
import FormError from "../../../components/form/FormError";

export default function Login() {
  const navigate = useNavigate();
  const { saveUser } = useContext(UserContext);
  const { saveUserToken } = useContext(AuthContext);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmitForm(data) {
    setServerError("");
    try {
      const response = await loginData(data);

      // This API wraps its payload ({ success, message, data: {...} }), but
      // tolerate a flat body so a shape change cannot throw past the guard below.
      const payload = response?.data ?? response;
      const token = payload?.token ?? response?.token;
      const user = payload?.user ?? response?.user;

      if (!token) {
        setServerError("Login succeeded but no token was returned. Please try again.");
        return;
      }

      // Persist auth state BEFORE navigating. ProtectedRoute gates "/" on
      // AuthContext.userToken, so navigating without updating the context
      // sends the guard straight back to /auth/login.
      if (user) saveUser(user);
      saveUserToken(token);

      navigate("/", { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error, "Invalid email or password. Please try again."));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div
        className="w-full max-w-[440px] sm:max-w-[480px] p-[1px] rounded-3xl bg-gradient-to-r
    from-[#00BFFF] via-[#00E5FF] to-[#0099FF]
    shadow-[0_0_20px_rgba(0,191,255,0.35)]"
      >
        {/* Card */}
        <div
          className="w-full
      bg-[#0A0A0A]
      rounded-3xl
      border border-white/5
      p-6 sm:p-8
      flex flex-col gap-6"
        >
          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-center text-white">
            Login to SocialHub
          </h1>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="flex flex-col gap-4"
          >
            <FormError message={serverError} />

            {/* Email */}
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                {...register("email")}
                className="w-full h-12 px-4
            bg-[#111] border border-white/10
            text-white placeholder:text-gray-500
            rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-cyan-400/40
            focus:border-cyan-400
            transition duration-200"
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full h-12 px-4
            bg-[#111] border border-white/10
            text-white placeholder:text-gray-500
            rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-cyan-400/40
            focus:border-cyan-400
            transition duration-200"
              />
              <FieldError message={errors.password?.message} />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 
          bg-gradient-to-r from-cyan-500 to-blue-600
          hover:from-cyan-400 hover:to-blue-500
          text-white rounded-xl font-semibold 
          transition duration-300 
          hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-70 mt-2 cursor-pointer"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>

            {/* Register */}
            <p className="text-center text-sm text-gray-500 pt-2">
              Don't have an account?
              <Link
                to="/auth/register"
                className="text-cyan-400 font-medium hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
