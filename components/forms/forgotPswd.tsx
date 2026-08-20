"use client";

import { forgotPassword } from "@/lib/api/user/auth.api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

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
      toast.error(
        message || "We are experiencing high traffic. Please try again later.",
      );
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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple text-2xl shadow-soft-sm">
              🔑
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Forgot Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your registered email to receive an OTP
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@ug.sharda.ac.in"
            />
          </div>

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Send OTP
          </Button>

          <p className="mt-2 rounded-lg border border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
            💡 Make sure to check your spam folder as well
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="font-bold text-foreground underline decoration-2 hover:text-primary cursor-pointer"
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
