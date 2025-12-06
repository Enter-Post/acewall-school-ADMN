import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeClosed } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";

const schema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["student", "teacher"], {
      required_error: "Please select a role",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[A-Z])/, "At least one uppercase letter")
      .regex(/^(?=.*[a-z])/, "At least one lowercase letter")
      .regex(/^(?=.*\d)/, "At least one number")
      .regex(/^(?=.*[#?!@$%^&*-])/, "At least one special character")
      .regex(/^(?!.*\s).*$/, "No spaces allowed"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignupPage = () => {
  const navigate = useNavigate();
  const { setAuthLoading } = useContext(GlobalContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data; // Remove confirmPassword before sending
    setAuthLoading(true);
    try {
      const res = await axiosInstance.post("auth/registerwithoutOTP", userData);
      toast.success(res.data?.message || "Account created successfully");
      navigate("/admin/signup");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <BackButton className="" />

      <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
        {/* Upload bulk users button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => navigate("/admin/bulksignup")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition duration-200"
          >
            Upload Bulk Users
          </button>
        </div>

        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Create an Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                {...register("firstName")}
                placeholder="Enter first name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                {...register("middleName")}
                placeholder="Enter middle name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                {...register("lastName")}
                placeholder="Enter last name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Enter email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Role
              </label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg">
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Re-enter password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showConfirmPassword ? (
                  <Eye size={18} />
                ) : (
                  <EyeClosed size={18} />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200"
            >
              Create Account
            </button>
          </form>

         
         
        </div>
      </div>
    </>
  );
};

export default SignupPage;
