"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/api/auth.api";

const VerifyEmailForm = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Read email safely on client
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verifyEmail");

    if (!storedEmail) {
      router.push("/register");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!email) return;

    setLoading(true);

    try {
      await verifyEmail({ email, otp });

      toast.success("Email verified successfully 🎉");

      // ✅ cleanup
      sessionStorage.removeItem("verifyEmail");
      setOtp("");

      router.push("/auth/login");
    } catch (error: unknown) {
      const message = "Email verification failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit OTP sent to your email
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full px-3 py-2 text-center tracking-widest border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p className="text-xs text-center text-gray-400">
          Didn’t receive the OTP? Check your spam folder.
        </p>
      </form>
    </div>
  );
};

export default VerifyEmailForm;
