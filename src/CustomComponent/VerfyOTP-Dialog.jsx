import { Eye, EyeClosed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader } from "lucide-react";
import { Input } from "@/components/ui/input";

const VerifyOTPDialog = ({ open, setOpen, type, sendingOTP, userId, email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return toast.error("Please enter all 6 digits.");

    setLoading(true);
    const payload = {
      otp: enteredOtp,
    };

    try {
      let res;

      if (type === "password") {
        res = await axiosInstance.put(`/auth/auth/updatePasswordById/${userId}`, payload);
      } else if (type === "email") {
        res = await axiosInstance.put(`/auth/auth/updateEmailById/${userId}`, payload);
      }

      toast.success(res.data.message);
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await axiosInstance.post("/auth/resendOTP", { email });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={sendingOTP}>
          {sendingOTP ? <Loader className="mr-2 animate-spin" /> : "Verify"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Verify OTP</DialogTitle>
          
          </div>
        </DialogHeader>

        {/* OTP input and other content */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, idx) => (
            <Input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputsRef.current[idx] = el)}
              className="w-12 h-12 text-center text-lg font-bold"
            />
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || otp.join("").length < 6}>
            {loading ? <Loader className="animate-spin mr-2" /> : "Verify"}
          </Button>
          <Button onClick={handleResend} variant="link" disabled={resendLoading}>
            {resendLoading ? <Loader className="animate-spin mr-2" /> : "Resend OTP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOTPDialog;
