"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Button, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/utils/errorHandler";

const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (!email.endsWith("@ug.sharda.ac.in")) {
      toast.error("Please use your Sharda email");
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      toast.success("Logged in successfully 🎉");
      setFormData({ email: "", password: "" });
      router.push("/library/dashboard");
    } catch (error: unknown) {
      // Preserve email on failed login, extract error message from response
      toast.error(getErrorMessage(error) || "Invalid credentials");
      // Keep email, clear only password for better UX
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-mint text-2xl shadow-soft-sm">
              👋
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Login with your Sharda email
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Email
            </label>
            <Input
              type="email"
              name="email"
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
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm font-bold text-foreground underline decoration-2 transition-colors hover:text-primary cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Login
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="font-bold text-foreground underline decoration-2 hover:text-primary cursor-pointer"
            >
              Register
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
