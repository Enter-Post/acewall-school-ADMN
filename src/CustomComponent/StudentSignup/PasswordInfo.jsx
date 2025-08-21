import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Eye, EyeClosed } from "lucide-react";

const PasswordInfo = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordTyping, setIsPasswordTyping] = useState(false);
  const [isConfirmPasswordTyping, setIsConfirmPasswordTyping] = useState(false);

  // Detect if the user is typing in the password field
  useEffect(() => {
    setIsPasswordTyping(password.length > 0);
  }, [password]);

  // Detect if the user is typing in the confirm password field
  useEffect(() => {
    setIsConfirmPasswordTyping(confirmPassword.length > 0);
  }, [confirmPassword]);

  // Combining regex patterns into a single regular expression for validation
  const passwordRules = {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long",
    },
    pattern: {
      value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-])(?=\S).*$/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (#?!@$%^&*-), and no spaces",
    },
  };

  // Define getClass function to apply conditional classes
  const getClass = (condition) =>
    `text-xs font-medium ${condition ? "text-green-600" : "text-red-500"}`;

  return (
    <div>
      {/* Password Field */}
      <div className="relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          {...register("password", passwordRules)}
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {isPasswordTyping && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
          </button>
        )}
        {errors?.password?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="mt-4 relative">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirm Password
        </label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          {...register("confirmPassword")}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {isConfirmPasswordTyping && (
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-300"
            tabIndex={-1}
          >
            {showConfirmPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
          </button>
        )}
        {errors?.confirmPassword?.message && (
          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Dynamic Password Rules */}
      <ol className="list-decimal pl-6 space-y-2 text-gray-700 mt-5 dark:text-gray-300">
        <li className={getClass(password.length >= 8)}>Minimum 8 characters</li>
        <li className={getClass(/[A-Z]/.test(password))}>At least one uppercase letter</li>
        <li className={getClass(/[a-z]/.test(password))}>At least one lowercase letter</li>
        <li className={getClass(/\d/.test(password))}>At least one digit</li>
        <li className={getClass(/[#?!@$%^&*-]/.test(password))}>At least one special character (#?!@$%^&*-)</li>
        <li className={getClass(!/\s/.test(password))}>No spaces allowed</li>
      </ol>
    </div>
  );
};

export default PasswordInfo;
