"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { requestModRole } from "@/lib/api/user/user.api";
import useAuthStore from "@/stores/user/authStore";
import { FiShield, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { Button, Input, Modal, Textarea } from "@/components/ui";

interface ModRequestFormProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ModRequestForm({
  isOpen,
  onClose,
  onSuccess,
}: ModRequestFormProps) {
  const { user, fetchMe } = useAuthStore();
  const [formData, setFormData] = useState({
    contactNo: "",
    motivation: "",
  });
  const [loading, setLoading] = useState(false);

  // Check if user already has a pending request
  const hasPendingRequest = user?.modRequest === "pending";
  const isApproved =
    user?.modRequest === "approved" ||
    user?.role === "mod" ||
    user?.role === "admin";
  const wasRejected = user?.modRequest === "rejected";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { contactNo, motivation } = formData;

    // Validation
    if (!contactNo || contactNo.length < 10) {
      toast.error("Please provide a valid contact number");
      setLoading(false);
      return;
    }

    if (!motivation || motivation.trim().length < 50) {
      toast.error(
        "Please write at least 50 characters about why you want to become a moderator",
      );
      setLoading(false);
      return;
    }

    try {
      await requestModRole({ contactNo, motivation });
      toast.success(
        "Moderator request submitted successfully! We'll review it soon.",
      );
      await fetchMe(); // Refresh user data
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit request";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ contactNo: "", motivation: "" });
    if (onClose) onClose();
  };

  const footer =
    !isApproved && !hasPendingRequest ? (
      <>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!formData.contactNo || formData.motivation.length < 50}
        >
          Submit Application
        </Button>
      </>
    ) : (
      <Button onClick={handleClose}>Close</Button>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <span className="inline-flex items-center gap-3">
          <FiShield className="text-primary" size={22} />
          Become a Moderator
        </span>
      }
      size="lg"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Already Approved State */}
        {isApproved && (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <FiCheckCircle className="text-success" size={48} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">
              You&apos;re already a{" "}
              {user?.role === "admin" ? "Admin" : "Moderator"}!
            </h3>
            <p className="text-muted-foreground">
              You have full moderation privileges. Visit your dashboard to
              start moderating content.
            </p>
          </div>
        )}

        {/* Pending State */}
        {hasPendingRequest && (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <FiClock className="text-warning" size={48} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">
              Request Pending
            </h3>
            <p className="mb-4 text-muted-foreground">
              Your moderator request is currently under review by our admin
              team.
            </p>
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
              <p className="text-sm text-warning">
                Submitted on:{" "}
                <span className="font-semibold">
                  {user?.modRequestAt
                    ? new Date(user.modRequestAt).toLocaleDateString()
                    : "Recently"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Rejection Notification */}
        {wasRejected && (
          <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <FiAlertCircle className="mt-0.5 shrink-0 text-destructive" size={20} />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Previous Request Not Approved
              </p>
              <p className="mt-1 text-sm text-destructive/80">
                You can submit a new request with updated information.
              </p>
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {!isApproved && !hasPendingRequest && (
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
            <p className="mb-3 text-sm font-semibold text-primary">
              📋 Moderator Responsibilities
            </p>
            <ul className="space-y-2 text-sm text-primary/90">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">✓</span>
                Review and approve uploaded resources
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">✓</span>
                Ensure content quality standards
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">✓</span>
                Help maintain library integrity
              </li>
            </ul>
          </div>
        )}

        {/* Form - Only show if not already approved or pending */}
        {!isApproved && !hasPendingRequest && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Contact Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Why should you be a moderator?{" "}
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                placeholder="Minimum 50 characters. Tell us about your experience and why you'd be great at moderating..."
                rows={4}
                required
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters
                </p>
                <span
                  className={`text-xs font-medium ${
                    formData.motivation.length < 50
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {formData.motivation.length}/50
                </span>
              </div>
            </div>

            {/* Contributions Info */}
            {user?.contributions !== undefined && (
              <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-success">
                    Your Contributions
                  </p>
                  <p className="text-xs text-success/80">
                    Active members are preferred
                  </p>
                </div>
                <span className="text-2xl font-bold text-success">
                  {user.contributions}
                </span>
              </div>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
}
