"use client";
import { login } from "@/lib/api/auth.api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";


const LoginForm = () => {
  const { email, setEmail, password, setPassword, loading, setLoading } = useAuthStore();
  const router = useRouter();  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }
    if (email.indexOf("@ug.sharda.ac.in") === -1) {
      toast.error("Please use your sharda email");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Logged in successfully");
      setEmail("");
      setPassword("");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your sharda email"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block mb-1 font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 roundedhover:bg-blue-600 transition-colors"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
export default LoginForm;
