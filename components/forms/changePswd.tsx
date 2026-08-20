"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { changePassword } from "@/lib/api/user/auth.api";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Button, Input } from "@/components/ui";

const ChangePasswordForm = () => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully. Please log in again.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      await logout();
      router.push("/auth/login");
    } catch {
      toast.error("Failed to change password");
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
              🔒
            </span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Change Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your account password
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Current Password
            </label>
            <Input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="pointer-events-auto text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                >
                  {showCurrentPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              New Password
            </label>
            <Input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Choose a password"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="pointer-events-auto text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-foreground">
              Confirm New Password
            </label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
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
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
