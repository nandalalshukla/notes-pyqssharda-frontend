"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/user/auth.api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Button, Input } from "@/components/ui";

const ResetPasswordForm = () => {
  const router = useRouter();

  const emailRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // ✅ Read email safely
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");

    if (!storedEmail) {
      router.push("/auth/forgot-password");
      return;
    }

    emailRef.current = storedEmail;
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { otp, newPassword, confirmNewPassword } = formData;

    if (!otp || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const email = emailRef.current;

    if (!email) return;

    setLoading(true);

    try {
      await resetPassword({
        email,
        otp,
        newPassword,
        confirmNewPassword,
      });

      toast.success("Password reset successfully 🎉");

      // ✅ cleanup
      sessionStorage.removeItem("resetEmail");

      setFormData({
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      router.push("/auth/login");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to reset password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft-lg sm:p-8"
      >
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-mint text-2xl shadow-soft-sm">
              🔐
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the OTP sent to your email and choose a new password
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              OTP
            </label>
            <Input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
              className="text-center text-lg font-bold tracking-[0.5em] placeholder:tracking-normal"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              New Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Choose a password"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pointer-events-auto text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Confirm New Password
            </label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="pointer-events-auto text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              }
            />
          </div>

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Reset Password
          </Button>

          <p className="rounded-lg border border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
            ⏰ Make sure the OTP is valid and not expired
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
