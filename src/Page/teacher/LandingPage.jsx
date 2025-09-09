import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobalContext } from "@/Context/GlobalProvider";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import BackButton from "@/CustomComponent/BackButton";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["student", "teacher"]),
});

const LandingPage = () => {
  const navigate = useNavigate();
  const { signUpdata, setSignupData } = useContext(GlobalContext);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      role: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post("auth/check-existence", {
        email: data.email,
      });

      setSignupData({ ...data });
      navigate("/admin/signup");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("User with this email already exists.");
      } else {
        console.error("API error:", error);
        toast.error("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <>
      <BackButton className="" />

      <div className="relative  ">
        {/* Top-right button */}
        <div className=" p-6">
          <button
            onClick={() => navigate("/admin/bulksignup")}
            className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition duration-200 z-10"
          >
            Upload Bulk Users
          </button>
        </div>
        <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-xl border border-gray-200 mx-auto mt-10">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Create an Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Enter user's email"
                {...register("email")}
                className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">Please select a role</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 ease-in-out"
              >
                Create an Account
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
