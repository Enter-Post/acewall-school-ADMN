"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/CustomComponent/BackButton";

const MAX_ADDRESS_LENGTH = 300;

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  pronoun: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email("Invalid email address"),
  homeAddress: z.string().min(1, "Home address is required"),
  mailingAddress: z.string(),
});

const EditGeneralInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      pronoun: "",
      gender: "",
      email: "",

      homeAddress: "",
      mailingAddress: "",
    },
  });
console.log(errors, "errrrrrrors")
  const fetchUser = async () => {
    setLoading(true);
    try {
      const teacherRes = await axiosInstance.get(`/admin/getTeacherById/${id}`);
      if (teacherRes?.data?.user) {
        setUser(teacherRes.data.user);
        fillForm(teacherRes.data.user);
        return;
      }
      throw new Error("Not a teacher");
    } catch {
      try {
        const studentRes = await axiosInstance.get(
          `/admin/getStudentById/${id}`
        );
        if (studentRes?.data?.user) {
          setUser(studentRes.data.user);
          fillForm(studentRes.data.user);
          console.log(studentRes.data);
          
        } else {
          throw new Error("Student not found");
        }
      } catch {
        toast.error("User not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillForm = (userData) => {
    for (const key in userData) {
      if (key in formSchema.shape) {
        setValue(key, userData[key] || "");
      }
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.put(
        `/auth/updateUserById/${id}`,
        data
      );
      console.log(response.data);
      toast.success(response.data.message || "User info updated");
      navigate(`/admin/account/${id}`);
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <BackButton />
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin"></Loader>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 space-y-8">
      <BackButton />

      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Account Information
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          {/* Personal Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  maxLength={15}
                  placeholder="John"
                  {...register("firstName")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
                  }}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  maxLength={15}
                  placeholder="M."
                  {...register("middleName")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
                  }}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  maxLength={15}
                  placeholder="Doe"
                  {...register("lastName")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
                  }}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Identity Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Identity Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Pronouns */}
              <div className="space-y-2">
                <Label>Preferred Pronoun *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "He/Him",
                    "She/Her",
                    "They/Them",
                    "Others",
                    "prefer not to say",
                  ].map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`pronoun-${p}`}
                        value={p.toLowerCase()}
                        {...register("pronoun")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label htmlFor={`pronoun-${p}`} className="text-sm">
                        {p}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender Identity</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Male",
                    "Female",
                    "Non-binary",
                    "Other",
                    "prefer not to say",
                  ].map((g) => (
                    <div key={g} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`gender-${g}`}
                        value={g.toLowerCase()}
                        {...register("gender")}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label htmlFor={`gender-${g}`} className="text-sm">
                        {g}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Address Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Home Address */}
              <div className="space-y-2">
                <Label htmlFor="homeAddress">Home Address</Label>
                <Textarea
                  id="homeAddress"
                  rows={3}
                  maxLength={MAX_ADDRESS_LENGTH}
                  {...register("homeAddress")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(
                      /[^A-Za-z0-9\s#?!@$%^&*.,'\/-]/g,
                      ""
                    );
                  }}
                />
                {errors.homeAddress && (
                  <p className="text-red-500 text-xs">
                    {errors.homeAddress.message}
                  </p>
                )}
              </div>

              {/* Mailing Address */}
              <div className="space-y-2">
                <Label htmlFor="mailingAddress">
                  Mailing Address (Optional)
                </Label>
                <Textarea
                  id="mailingAddress"
                  rows={3}
                  maxLength={MAX_ADDRESS_LENGTH}
                  {...register("mailingAddress")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(
                      /[^A-Za-z0-9\s#?!@$%^&*.,'\/-]/g,
                      ""
                    );
                  }}
                />
                {errors.mailingAddress && (
                  <p className="text-red-500 text-xs">
                    {errors.mailingAddress.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2.5 rounded-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin" size={16} />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditGeneralInfo;
