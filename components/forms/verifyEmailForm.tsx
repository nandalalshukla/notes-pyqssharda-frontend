"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/api/user/auth.api";
import { Button, Input } from "@/components/ui";

const VerifyEmailForm = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Read email safely on client
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verifyEmail");

    if (!storedEmail) {
      router.push("/auth/register");
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
    } catch {
      toast.error("Email verification failed");
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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-coral text-2xl shadow-soft-sm">
              📧
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Verify Your Email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to your email
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              OTP
            </label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-lg font-bold tracking-[0.5em]"
              placeholder="Enter OTP"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Verify Email
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              sessionStorage.removeItem("verifyEmail");
              router.push("/auth/login");
            }}
          >
            Skip &amp; Login Directly
          </Button>

          <p className="rounded-lg border border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
            Check your spam folder if you did not receive the OTP.
          </p>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmailForm;
