"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiCheckCircle, FiFlag, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { useReportStore } from "@/stores/social/report.store";
import {
  CreateReportPayload,
  ReportReason,
  ReportTargetType,
} from "@/lib/api/social/report.api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetOwner: string;
}

const reasonOptions: {
  value: ReportReason;
  label: string;
  description: string;
}[] = [
  {
    value: "spam",
    label: "Spam",
    description: "Unwanted or repetitive content",
  },
  {
    value: "harassment",
    label: "Harassment",
    description: "Threats, bullying, or targeted abuse",
  },
  {
    value: "hate",
    label: "Hate",
    description: "Hateful or discriminatory speech",
  },
  {
    value: "nudity",
    label: "Nudity",
    description: "Explicit or adult content",
  },
  {
    value: "violence",
    label: "Violence",
    description: "Graphic harm or violent threats",
  },
  {
    value: "fake_information",
    label: "False information",
    description: "Misleading or deceptive content",
  },
  {
    value: "scam",
    label: "Scam",
    description: "Fraud, phishing, or impersonation",
  },
  { value: "other", label: "Other", description: "Something else" },
];

const getTargetLabel = (targetType: ReportTargetType) => {
  if (targetType === "post") return "Post";
  if (targetType === "comment") return "Comment";
  return "User";
};

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetOwner,
}: ReportModalProps) {
  const { user } = useAuthStore();
  const { isSubmitting, success, error, submitReport, resetReportState } =
    useReportStore();

  useBodyScroll(isOpen);

  const [reason, setReason] = useState<ReportReason | "">("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const isSelfReport = useMemo(() => {
    if (!user?._id) return false;
    return user._id === targetOwner;
  }, [user?._id, targetOwner]);

  const canSubmit = Boolean(reason) && !isSubmitting && !success;

  useEffect(() => {
    if (isOpen) return;

    setReason("");
    setMessage("");
    setTouched(false);
    resetReportState();
  }, [isOpen, resetReportState]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
  }, [error]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setTouched(true);

      if (!reason) return;
      if (!user?._id) {
        toast.error("Please login to report content");
        return;
      }
      if (isSelfReport) {
        toast.error("You cannot report your own content");
        return;
      }

      const payload: CreateReportPayload = {
        targetType,
        targetId,
        reason,
        message: message.trim() ? message.trim() : undefined,
      };

      try {
        await submitReport(payload);
        toast.success("Report submitted successfully");
      } catch {
        // Error handled in store toast
      }
    },
    [
      reason,
      user?._id,
      isSelfReport,
      targetType,
      targetId,
      message,
      submitReport,
    ],
  );

  const targetLabel = getTargetLabel(targetType);

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
              <Dialog.Panel className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                      <FiFlag size={18} />
                    </span>
                    <div>
                      <Dialog.Title className="text-lg font-bold text-gray-900">
                        Report {targetLabel}
                      </Dialog.Title>
                      <p className="text-xs text-gray-500">
                        Help us keep the community safe.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close report dialog"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Reporting a {targetLabel.toLowerCase()} helps our moderators
                    review unsafe content faster.
                  </div>

                  {!user?._id && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Please log in to submit a report.
                    </div>
                  )}

                  {isSelfReport && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      You cannot report your own content.
                    </div>
                  )}

                  {success ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
                      <FiCheckCircle
                        className="mx-auto mb-2 text-emerald-600"
                        size={28}
                      />
                      <h3 className="text-base font-semibold text-emerald-900">
                        Report received
                      </h3>
                      <p className="text-sm text-emerald-700 mt-1">
                        Thanks for helping us keep the community safe.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Select a reason
                        </p>
                        <div className="space-y-2">
                          {reasonOptions.map((option) => {
                            const selected = reason === option.value;
                            return (
                              <button
                                type="button"
                                key={option.value}
                                onClick={() => setReason(option.value)}
                                className={`w-full text-left border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  selected
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`mt-1 inline-flex h-4 w-4 rounded-full border-2 ${
                                      selected
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {option.label}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {option.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {touched && !reason && (
                          <p className="mt-2 text-xs text-red-600">
                            Please select a reason.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Add more context (optional)
                        </label>
                        <textarea
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          maxLength={500}
                          placeholder="Share anything that can help us review this report faster."
                        />
                        <div className="mt-2 flex justify-between text-xs text-gray-400">
                          <span>Max 500 characters</span>
                          <span>{message.length}/500</span>
                        </div>
                      </div>
                    </>
                  )}
                </form>

                <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Reports are confidential. We will review and take action if
                    needed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSelfReport || !user?._id}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : success
                          ? "Submitted"
                          : "Submit report"}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
