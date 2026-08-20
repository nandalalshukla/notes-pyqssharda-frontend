"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { register } from "@/lib/api/user/auth.api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Button, Input } from "@/components/ui";

const RegisterForm = () => {
  const router = useRouter();

  // ✅ LOCAL form state (correct)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Generic change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, username, email, password, confirmPassword } = formData;

    // ✅ Validations
    if (!name || !username || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error(
        "Username can only contain letters, numbers, and underscores",
      );
      return;
    }

    if (!email.endsWith("@ug.sharda.ac.in")) {
      toast.error("Please use your Sharda email");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({ name, username, email, password, confirmPassword });
      sessionStorage.setItem("verifyEmail", email);
      toast.success("Registration successful!");
      toast.success("Please verify the OTP sent to your email.");

      // ✅ Clear form
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // ✅ Navigate to FRONTEND verify page
      router.push("/auth/verify-email");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft-lg sm:p-8"
      >
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-coral text-2xl shadow-soft-sm">
              ✨
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register with your Sharda email
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Username
            </label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a unique username"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Letters, numbers, and underscores only (min. 3 characters)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourname@ug.sharda.ac.in"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Password
            </label>
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
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
              Confirm Password
            </label>
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
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
            Register
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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

export default RegisterForm;
