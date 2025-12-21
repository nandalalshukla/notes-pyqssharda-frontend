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

  // âœ… Read email safely on client
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

      toast.success("Email verified successfully ðŸŽ‰");

      // âœ… cleanup
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
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <span className="w-12 h-12 rounded-full border-2 border-black bg-[#FF9F66] flex items-center justify-center text-2xl">
              📧
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Verify Your Email</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter the 6-digit OTP sent to your email
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-black mb-1">OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-3 text-center tracking-[0.5em] rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-lg font-bold text-black placeholder:text-gray-400"
            placeholder="Enter OTP"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p className="text-xs text-center text-gray-500 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
          Check your spam folder if you did not receive the OTP.
        </p>
      </form>
    </div>
  );
};

export default VerifyEmailForm;
