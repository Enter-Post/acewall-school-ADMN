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
      <BackButton className="mb-10" />

      <div className="min-h-screen flex items-center justify-center ">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Create an Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <SelectTrigger className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
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


        </div>
      </div>
    </>
  );
};

export default LandingPage;
