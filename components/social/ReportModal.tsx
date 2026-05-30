"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiCheckCircle,
  FiFlag,
  FiX,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
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
  const {
    isSubmitting,
    success,
    error,
    errorFeedback,
    submitReport,
    resetReportState,
  } = useReportStore();

  useBodyScroll(isOpen);

  const [reason, setReason] = useState<ReportReason | "">("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [retryCounter, setRetryCounter] = useState<number | null>(null);

  const isSelfReport = useMemo(() => {
    if (!user?._id) return false;
    return user._id === targetOwner;
  }, [user?._id, targetOwner]);

  const canSubmit =
    Boolean(reason) && !isSubmitting && !success && !isSelfReport && user?._id;

  // Countdown timer for retry
  useEffect(() => {
    if (!errorFeedback?.retryAfter) {
      setRetryCounter(null);
      return;
    }

    setRetryCounter(errorFeedback.retryAfter);
    const timer = setInterval(() => {
      setRetryCounter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [errorFeedback?.retryAfter]);

  useEffect(() => {
    if (isOpen) return;

    setReason("");
    setMessage("");
    setTouched(false);
    setRetryCounter(null);
    resetReportState();
  }, [isOpen, resetReportState]);

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
        // Success message shown in modal
      } catch {
        // Error handled and displayed in modal
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
                {/* Header */}
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
                        Help us keep the community safe
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close report dialog"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  {/* Info Banner */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                    <p className="font-medium">
                      Your report is confidential and helps our team maintain a
                      safe community.
                    </p>
                  </div>

                  {/* Error State - Duplicate Report */}
                  {error?.code === "DUPLICATE_REPORT" && (
                    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                      <div className="flex gap-3">
                        <FiCheckCircle
                          className="text-amber-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-semibold text-amber-900">
                            {errorFeedback?.title}
                          </p>
                          <p className="text-sm text-amber-800 mt-1">
                            {errorFeedback?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State - Rate Limit / Cooldown */}
                  {error?.code === "REPORT_COOLDOWN" && (
                    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                      <div className="flex gap-3">
                        <FiClock
                          className="text-orange-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-semibold text-orange-900">
                            {errorFeedback?.title}
                          </p>
                          <p className="text-sm text-orange-800 mt-1">
                            {errorFeedback?.description}
                          </p>
                          {retryCounter !== null && (
                            <p className="text-xs font-mono text-orange-700 mt-2 bg-orange-100 px-2 py-1 rounded w-fit">
                              Wait {retryCounter}s
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State - Rate Limit Exceeded */}
                  {error?.code === "RATE_LIMIT_EXCEEDED" && (
                    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                      <div className="flex gap-3">
                        <FiAlertCircle
                          className="text-orange-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-semibold text-orange-900">
                            {errorFeedback?.title}
                          </p>
                          <p className="text-sm text-orange-800 mt-1">
                            {errorFeedback?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State - Self Report */}
                  {error?.code === "SELF_REPORT" && (
                    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                      <div className="flex gap-3">
                        <FiAlertCircle
                          className="text-red-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-semibold text-red-900">
                            {errorFeedback?.title}
                          </p>
                          <p className="text-sm text-red-800 mt-1">
                            {errorFeedback?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State - Target Not Found */}
                  {error?.code === "TARGET_NOT_FOUND" && (
                    <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                      <div className="flex gap-3">
                        <FiAlertCircle
                          className="text-red-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <p className="font-semibold text-red-900">
                            {errorFeedback?.title}
                          </p>
                          <p className="text-sm text-red-800 mt-1">
                            {errorFeedback?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State - Generic Error */}
                  {error &&
                    ![
                      "DUPLICATE_REPORT",
                      "REPORT_COOLDOWN",
                      "RATE_LIMIT_EXCEEDED",
                      "SELF_REPORT",
                      "TARGET_NOT_FOUND",
                    ].includes(error.code) && (
                      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                        <div className="flex gap-3">
                          <FiAlertCircle
                            className="text-red-600 flex-shrink-0 mt-0.5"
                            size={20}
                          />
                          <div>
                            <p className="font-semibold text-red-900">
                              {errorFeedback?.title}
                            </p>
                            <p className="text-sm text-red-800 mt-1">
                              {errorFeedback?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Success State */}
                  {success ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
                      <FiCheckCircle
                        className="mx-auto mb-3 text-emerald-600"
                        size={32}
                      />
                      <h3 className="text-base font-bold text-emerald-900">
                        Report Submitted
                      </h3>
                      <p className="text-sm text-emerald-700 mt-2">
                        Thank you for helping keep our community safe. Our
                        moderation team will review this report shortly.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Login Required */}
                      {!user?._id && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          Please log in to submit a report.
                        </div>
                      )}

                      {/* Self Report Warning */}
                      {isSelfReport && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                          You cannot report your own content.
                        </div>
                      )}

                      {/* Reason Selection */}
                      {!error && (
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-3">
                            Select a reason{" "}
                            <span className="text-red-600">*</span>
                          </p>
                          <div className="space-y-2">
                            {reasonOptions.map((option) => {
                              const selected = reason === option.value;
                              return (
                                <button
                                  type="button"
                                  key={option.value}
                                  onClick={() => {
                                    setReason(option.value);
                                    setTouched(true);
                                  }}
                                  disabled={isSubmitting}
                                  className={`w-full text-left border rounded-xl px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                              <FiAlertCircle size={14} />
                              Please select a reason
                            </p>
                          )}
                        </div>
                      )}

                      {/* Additional Context */}
                      {!error && reason === "other" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Please describe the issue{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            value={message}
                            onChange={(event) => {
                              setMessage(event.target.value);
                            }}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50"
                            rows={3}
                            maxLength={500}
                            placeholder="Please provide details about why you're reporting this..."
                            required
                          />
                          <div className="mt-2 flex justify-between text-xs text-gray-400">
                            <span>Required when reason is "Other"</span>
                            <span>{message.length}/500</span>
                          </div>
                        </div>
                      )}

                      {/* Optional Additional Context */}
                      {!error && reason !== "other" && reason && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Add more context (optional)
                          </label>
                          <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-50"
                            rows={3}
                            maxLength={500}
                            placeholder="Provide any additional details that might help us review this report..."
                          />
                          <div className="mt-2 flex justify-between text-xs text-gray-400">
                            <span>Max 500 characters</span>
                            <span>{message.length}/500</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </form>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Reports are confidential and reviewed by our moderation team
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {success ? "Close" : "Cancel"}
                    </button>
                    {!success && (
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!canSubmit || retryCounter !== null}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isSubmitting && (
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                        {isSubmitting
                          ? "Submitting..."
                          : retryCounter !== null
                            ? `Wait ${retryCounter}s`
                            : "Submit Report"}
                      </button>
                    )}
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
