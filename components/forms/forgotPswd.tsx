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
      setEmail("");
      router.push("/auth/reset-password");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <span className="w-12 h-12 rounded-full border-2 border-black bg-[#C084FC] flex items-center justify-center text-2xl">
              🔑
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Forgot Password</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter your registered email to receive an OTP
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              placeholder="yourname@ug.sharda.ac.in"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <p className="text-xs text-center text-gray-500 mt-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
            💡 Make sure to check your spam folder as well
          </p>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="font-bold text-black hover:text-[#C084FC] underline decoration-2"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
