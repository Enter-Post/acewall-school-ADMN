import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import VerifyOTPDialog from "@/CustomComponent/VerfyOTP-Dialog";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import BackButton from "@/CustomComponent/BackButton";
import { useParams } from "react-router-dom";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Old password is required")
      .max(50, "Password must be less than 50 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be less than 50 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one digit")
      .regex(/[#?!@$%^&*-]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function EditCredentials() {
  const { id } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOTPDialogOpen, setIsOTPDialogOpen] = useState(false);
  const [otpType, setOtpType] = useState(null); // ✅ Fix: Initialize otpType
  const [sendingOTP, setSendingOTP] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = passwordForm.watch("newPassword") || "";
  const oldPassword = passwordForm.watch("oldPassword");
  const confirmPassword = passwordForm.watch("confirmPassword");
  const isSameAsOld = oldPassword === newPassword;

  const isMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecialChar = /[#?!@$%^&*-]/.test(newPassword);

  const getClass = (condition) =>
    `text-xs font-medium ${condition ? "text-green-600" : "text-red-500"}`;

  const handleEmailSubmit = async (data) => {
    if (!id) return toast.error("Invalid user ID");
    setSendingOTP(true);
    try {
      const res = await axiosInstance.put(`/auth/auth/updateEmailOTPById/${id}`, {
        newEmail: data.email,
      });
      toast.success(res.data.message);
      setEmailToVerify(data.email);
      setOtpType("email");
      setIsOTPDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOTP(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    if (!id) return toast.error("Invalid user ID");
    if (data.oldPassword === data.newPassword) {
      toast.error("New password must be different from the old password");
      return;
    }

    setSendingOTP(true);
    try {
      const res = await axiosInstance.put(`/auth/auth/updatePasswordOTPById/${id}`, data);
      toast.success(res.data.message);
      setOtpType("password");
      setIsOTPDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSendingOTP(false);
    }
  };

  return (
    <section className="h-full">
      <BackButton />
      <div className="w-full max-w-sm flex-col gap-6 mt-10">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Email</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          {/* Email Tab */}
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    Make changes to your email here.
                    <p className="mt-2">User ID: {id}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...emailForm.register("email")} />
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={sendingOTP}>
                    {sendingOTP ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>

          {/* Password Tab */}
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Choose a strong password you can remember.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {/* Old password */}
                  <div className="grid gap-3 relative">
                    <Label htmlFor="oldPassword">Current password</Label>
                    <Input
                      id="oldPassword"
                      type={showPassword ? "text" : "password"}
                      {...passwordForm.register("oldPassword")}
                    />
                    {oldPassword && (
                      <button
                        type="button"
                        className="absolute right-2 top-9"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                      </button>
                    )}
                    {passwordForm.formState.errors.oldPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        {passwordForm.formState.errors.oldPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New password */}
                  <div className="grid gap-3 relative">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register("newPassword")}
                    />
                    {isSameAsOld && (
                      <p className="text-xs text-red-600 mt-1">
                        New password must be different from the old password.
                      </p>
                    )}
                    {newPassword && (
                      <button
                        type="button"
                        className="absolute right-2 top-9"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                      </button>
                    )}
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="grid gap-3 relative">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordForm.register("confirmPassword")}
                      autoComplete="new-password"
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    {confirmPassword && (
                      <button
                        type="button"
                        className="absolute right-2 top-9"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                      </button>
                    )}
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Password validation checklist */}
                  <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300 mt-2">
                    <li className={getClass(isMinLength)}>Minimum 8 characters</li>
                    <li className={getClass(hasUppercase)}>At least one uppercase letter</li>
                    <li className={getClass(hasLowercase)}>At least one lowercase letter</li>
                    <li className={getClass(hasDigit)}>At least one digit</li>
                    <li className={getClass(hasSpecialChar)}>At least one special character</li>
                  </ol>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={sendingOTP}>
                    {sendingOTP ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </div>

      {/* OTP Dialog */}
      {otpType && (
        <VerifyOTPDialog
          open={isOTPDialogOpen}
          setOpen={setIsOTPDialogOpen}
          type={otpType}
          sendingOTP={sendingOTP}
          userId={id}
          email={emailToVerify}
        />
      )}
    </section>
  );
}
