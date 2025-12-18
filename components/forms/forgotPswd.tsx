"use client";

import { forgotPassword } from "@/lib/api/auth.api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!email.endsWith("@ug.sharda.ac.in")) {
      toast.error("Please use your sharda email");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      sessionStorage.setItem("resetEmail", email);
      toast.success("If an account exists, an OTP has been sent to your email");
      setEmail("")
      router.push("/reset-password");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Failed to send password reset link");
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
            Forgot Password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your registered email to receive an OTP
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="yourname@ug.sharda.ac.in"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <p className="text-xs text-center text-gray-400">
          Make sure to check your spam folder as well
        </p>
      </form>
    </div>
  );

};

export default ForgotPasswordForm;
