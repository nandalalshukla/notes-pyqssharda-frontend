"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { verifyEmail } from "../../lib/api/auth.api";

const VerifyEmailForm = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    if (!token) {
      toast.error("Invalid verification link. Please register again.");
      return;
    }
    setLoading(true);
    try {
      console.log({ otp, token });
      await verifyEmail({ otp, token });
      toast.success("Email verified successfully");
      setOtp("");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.log("Full error:", error);
      console.log(
        "Error response:",
        (error as { response?: { data?: unknown } })?.response?.data
      );
      const message =
        error instanceof Error && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Email verification failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block mb-1 font-medium">
          OTP
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter the OTP sent to your email"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify Email"}
      </button>
    </form>
  );
};
export default VerifyEmailForm;
