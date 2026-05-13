"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { requestModRole } from "@/lib/api/user/user.api";
import useAuthStore from "@/stores/user/authStore";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import {
  FiX,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";

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

  // Prevent body scroll when modal is open
  useBodyScroll(isOpen);

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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
                  <Dialog.Title className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <FiShield className="text-blue-600" size={24} />
                    Become a Moderator
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Already Approved State */}
                  {isApproved && (
                    <div className="text-center py-6">
                      <div className="flex justify-center mb-4">
                        <FiCheckCircle className="text-green-600" size={48} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        You&apos;re already a{" "}
                        {user?.role === "admin" ? "Admin" : "Moderator"}!
                      </h3>
                      <p className="text-gray-600">
                        You have full moderation privileges. Visit your
                        dashboard to start moderating content.
                      </p>
                    </div>
                  )}

                  {/* Pending State */}
                  {hasPendingRequest && (
                    <div className="text-center py-6">
                      <div className="flex justify-center mb-4">
                        <FiClock className="text-yellow-600" size={48} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Request Pending
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your moderator request is currently under review by our
                        admin team.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                      <FiAlertCircle
                        className="text-red-600 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          Previous Request Not Approved
                        </p>
                        <p className="text-sm text-red-800 mt-1">
                          You can submit a new request with updated information.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {!isApproved && !hasPendingRequest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-3">
                        📋 Moderator Responsibilities
                      </p>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          Review and approve uploaded resources
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          Ensure content quality standards
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">✓</span>
                          Help maintain library integrity
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Form - Only show if not already approved or pending */}
                  {!isApproved && !hasPendingRequest && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Contact Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          name="contactNo"
                          value={formData.contactNo}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all"
                          required
                        />
                      </div>

                      {/* Motivation */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Why should you be a moderator?{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="motivation"
                          value={formData.motivation}
                          onChange={handleChange}
                          placeholder="Minimum 50 characters. Tell us about your experience and why you'd be great at moderating..."
                          rows={4}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 transition-all"
                          required
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">
                            Minimum 50 characters
                          </p>
                          <span
                            className={`text-xs font-medium ${
                              formData.motivation.length < 50
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {formData.motivation.length}/50
                          </span>
                        </div>
                      </div>

                      {/* Contributions Info */}
                      {user?.contributions !== undefined && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold text-green-900 uppercase">
                              Your Contributions
                            </p>
                            <p className="text-xs text-green-700">
                              Active members are preferred
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {user.contributions}
                          </span>
                        </div>
                      )}
                    </form>
                  )}
                </div>

                {/* Footer */}
                {!isApproved && !hasPendingRequest && (
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        !formData.contactNo ||
                        formData.motivation.length < 50
                      }
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                )}

                {isApproved && (
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}

                {hasPendingRequest && (
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
