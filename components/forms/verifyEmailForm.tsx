"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { verifyEmail, resendOtp } from "@/lib/api/user/auth.api";
import useAuthStore from "@/stores/user/authStore";
import { getApiError, getErrorMessage } from "@/lib/utils/errorHandler";
import { Button, Input } from "@/components/ui";

const subscribeToSessionStorage = () => () => {};
const getStoredVerificationEmail = () =>
  typeof window === "undefined" ? null : sessionStorage.getItem("verifyEmail");
const getServerVerificationEmail = () => null;

const VerifyEmailForm = () => {
  const router = useRouter();
  const completeEmailVerification = useAuthStore(
    (s) => s.completeEmailVerification,
  );
  const [otp, setOtp] = useState("");
  const email = useSyncExternalStore(
    subscribeToSessionStorage,
    getStoredVerificationEmail,
    getServerVerificationEmail,
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Read the browser-only address after hydration without setting state
  // synchronously from an effect (which also avoids a server/client mismatch).
  useEffect(() => {
    if (!email) {
      router.push("/auth/register");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!email) return;

    setLoading(true);

    try {
      const res = await verifyEmail({ email, otp });
      const user = res.data?.data?.user;

      // Verifying the OTP signs the user in — the server issued the
      // session cookies with this very response, so there is no second
      // login to make them sit through. Adopting the user it returned is
      // what moves the client into the matching signed-in state; without
      // it the cookies are valid but the app still renders as logged out.
      if (user) {
        completeEmailVerification(user);
      }

      // ✅ cleanup
      sessionStorage.removeItem("verifyEmail");
      setOtp("");

      if (user) {
        toast.success("Email verified — you're all set 🎉");
        const returnTo = sessionStorage.getItem("authReturnTo");
        sessionStorage.removeItem("authReturnTo");
        const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/library/dashboard";
        router.replace(safeReturnTo);
      } else {
        // No user in the payload means the session didn't come back for
        // some reason; falling back to the login screen is the safe
        // outcome, since the verification itself did succeed.
        toast.success("Email verified successfully 🎉");
        router.push("/auth/login");
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const message = apiError.message;

      if (apiError.code === "REGISTRATION_EXPIRED") {
        sessionStorage.removeItem("verifyEmail");
        toast.error(message);
        router.replace("/auth/register");
        return;
      }

      // An email that's already verified has nothing left to do here —
      // usually a stale tab, or a second submit of the same OTP. Sending
      // them to login (which will now accept them) beats stranding them on
      // a form whose only button will keep failing.
      if (message.toLowerCase().includes("already verified")) {
        sessionStorage.removeItem("verifyEmail");
        toast.success("Your email is already verified — just sign in");
        router.push("/auth/login");
        return;
      }

      toast.error(message || "Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending) return;

    setResending(true);
    try {
      const response = await resendOtp({ email });
      toast.success(
        response.data?.message ||
          "If your registration is still active, a verification code will be sent. Codes expire after 10 minutes.",
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Could not resend the OTP");
    } finally {
      setResending(false);
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
          <h1 className="text-2xl font-black text-foreground">
            Verify Your Email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-semibold text-foreground">
              {email || "your email"}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              OTP
            </label>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-lg font-bold tracking-[0.5em]"
              placeholder="Enter OTP"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Verify &amp; Continue
          </Button>

          {/* Replaces the old "Skip & Login Directly" button, which led
              nowhere: logging in without a verified email is refused by the
              server, so the only way forward was always this OTP. What a
              stuck user actually needs is another one. */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            loading={resending}
            onClick={handleResend}
          >
            Resend OTP
          </Button>

          <p className="rounded-lg border border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
            Check your spam folder if you did not receive the code. Codes
            expire after 10 minutes; your registration expires after 24 hours.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            If your registration has expired,{" "}
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("verifyEmail");
                router.push("/auth/register");
              }}
              className="font-semibold text-primary underline underline-offset-2"
            >
              create a new account
            </button>
            .
          </p>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmailForm;
