import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerData } from "../../../services/registerServices";
import { registerSchema } from "../../../schema/registerschema";
import { useContext, useState } from "react";
import { UserContext } from "./../../../context/UserContext";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import FieldError from "../../../components/form/FieldError";
import FormError from "../../../components/form/FormError";

export default function Register() {
  const { saveUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",

    // default Data
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      password: "",
      rePassword: "",
    },
  });

  // Get Data from API
  async function onSubmitForm(data) {
    setServerError("");
    try {
      const response = await registerData(data);
      localStorage.setItem("token", response.data.token);
      saveUser(response.data.user);
      navigate("/auth/login");
    } catch (error) {
      setServerError(getErrorMessage(error, "Registration failed. Please try again."));
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
      {/* Glow Border Wrapper */}
      <div className="w-full max-w-[440px] sm:max-w-[480px] p-[1px] rounded-3xl bg-gradient-to-r from-[#00BFFF] via-[#00E5FF] to-[#0099FF] shadow-[0px_0px_20px_rgba(0,191,255,0.35)]">
        {/* Card */}
        <div className="w-full bg-[#0A0A0A] rounded-3xl shadow-xl border border-white/5 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            Create Account
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Join us and start your journey
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmitForm)}>
            <FormError message={serverError} />

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white placeholder:text-gray-500
               rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400
               transition duration-200"
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* username */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition duration-200"
                {...register("username")}
              />
              <FieldError message={errors.username?.message} />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white placeholder:text-gray-500
               rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition duration-200"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white placeholder:text-gray-500
               rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition duration-200"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white placeholder:text-gray-500
              rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition duration-200"
                {...register("rePassword")}
              />
              <FieldError message={errors.rePassword?.message} />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <input
                type="date"
                className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition duration-200"
                {...register("dateOfBirth")}
              />
              <FieldError message={errors.dateOfBirth?.message} />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-400 mb-2">Select Gender</p>
              <div className="flex gap-6 text-gray-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    className="accent-cyan-500"
                    {...register("gender")}
                  />
                  Male
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    className="accent-cyan-500"
                    {...register("gender")}
                  />
                  Female
                </label>
              </div>
              <FieldError message={errors.gender?.message} />
            </div>
            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 
  hover:from-cyan-400 hover:to-blue-500 text-white py-3 
  rounded-xl font-semibold transition duration-300 
  hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?
              <Link
                to="/auth/login"
                className="text-cyan-400 font-medium hover:underline cursor-pointer"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
