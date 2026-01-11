"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error("Invalid email or password");
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
            <span className="w-12 h-12 rounded-full border-2 border-black bg-[#4ADE80] flex items-center justify-center text-2xl">
              👋
            </span>
          </div>
          <h1 className="text-2xl font-black text-black">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-1">
            Login with your Sharda email
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              placeholder="yourname@ug.sharda.ac.in"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-sm font-medium text-black placeholder:text-gray-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm font-bold text-black hover:text-[#4ADE80] transition-colors underline decoration-2"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="font-bold text-black hover:text-[#4ADE80] underline decoration-2"
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
