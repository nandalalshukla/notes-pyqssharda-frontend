"use client";

import { register } from "@/lib/api/auth.api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const RegisterForm = () => {
  const router = useRouter();

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    setLoading,
  } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all the fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (email.indexOf("@ug.sharda.ac.in") === -1) {
      toast.error("Please use your sharda email");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name, email, password, confirmPassword });
      const verifyToken = res.data.verifyToken;
      toast.success("Registered successfully. Please verify your email.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      toast.success(
        "Please verify your email. Enter the OTP sent to your sharda email."
      );

      router.push(`/api/v1/auth/verify-email?token=${verifyToken}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1 font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Your full name"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
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
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter password"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block mb-1 font-medium">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Confirm your password"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
