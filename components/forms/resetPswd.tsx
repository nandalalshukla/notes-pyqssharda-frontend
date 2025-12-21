"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth.api";

const ResetPasswordForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // ✅ Read email safely
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");

    if (!storedEmail) {
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);
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

    if (!email) return;

    setLoading(true);

    try {
      await resetPassword({
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successfully 🎉");

      // ✅ cleanup
      sessionStorage.removeItem("resetEmail");

      setFormData({
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      router.push("/login");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <span className="w-12 h-12 rounded-full border-2 border-black bg-[#4ADE80] flex items-center justify-center text-2xl">
              🔐
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Reset Password</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter the OTP sent to your email and choose a new password
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              OTP
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
              className="w-full px-4 py-3 text-center tracking-[0.5em] rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-lg font-bold text-black placeholder:text-gray-400 placeholder:tracking-normal"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="text-xs text-center text-gray-500 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
            ⏰ Make sure the OTP is valid and not expired
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
