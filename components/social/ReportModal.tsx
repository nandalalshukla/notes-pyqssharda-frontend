"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiFlag,
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
import { Modal, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

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

function ErrorBanner({
  tone,
  icon,
  title,
  description,
  extra,
}: {
  tone: "warning" | "destructive";
  icon: React.ReactNode;
  title?: string;
  description?: string;
  extra?: React.ReactNode;
}) {
  const toneClass =
    tone === "warning"
      ? "border-warning/30 bg-warning/10 text-warning"
      : "border-destructive/30 bg-destructive/10 text-destructive";
  return (
    <div className={cn("rounded-xl border-2 p-4", toneClass)}>
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-90">{description}</p>
          {extra}
        </div>
      </div>
    </div>
  );
}

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
  const knownErrorCodes = [
    "DUPLICATE_REPORT",
    "REPORT_COOLDOWN",
    "RATE_LIMIT_EXCEEDED",
    "SELF_REPORT",
    "TARGET_NOT_FOUND",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-warning/15 text-warning">
            <FiFlag size={18} />
          </span>
          Report {targetLabel}
        </span>
      }
      description="Help us keep the community safe"
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Reports are confidential and reviewed by our moderation team
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {success ? "Close" : "Cancel"}
            </Button>
            {!success && (
              <Button
                type="submit"
                form="report-form"
                loading={isSubmitting}
                disabled={!canSubmit || retryCounter !== null}
              >
                {retryCounter !== null ? `Wait ${retryCounter}s` : "Submit Report"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form id="report-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Info Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm font-medium text-primary">
          Your report is confidential and helps our team maintain a safe community.
        </div>

        {error?.code === "DUPLICATE_REPORT" && (
          <ErrorBanner
            tone="warning"
            icon={<FiCheckCircle size={20} />}
            title={errorFeedback?.title}
            description={errorFeedback?.description}
          />
        )}

        {error?.code === "REPORT_COOLDOWN" && (
          <ErrorBanner
            tone="warning"
            icon={<FiClock size={20} />}
            title={errorFeedback?.title}
            description={errorFeedback?.description}
            extra={
              retryCounter !== null && (
                <p className="mt-2 w-fit rounded bg-warning/15 px-2 py-1 font-mono text-xs">
                  Wait {retryCounter}s
                </p>
              )
            }
          />
        )}

        {error?.code === "RATE_LIMIT_EXCEEDED" && (
          <ErrorBanner
            tone="warning"
            icon={<FiAlertCircle size={20} />}
            title={errorFeedback?.title}
            description={errorFeedback?.description}
          />
        )}

        {error?.code === "SELF_REPORT" && (
          <ErrorBanner
            tone="destructive"
            icon={<FiAlertCircle size={20} />}
            title={errorFeedback?.title}
            description={errorFeedback?.description}
          />
        )}

        {error?.code === "TARGET_NOT_FOUND" && (
          <ErrorBanner
            tone="destructive"
            icon={<FiAlertCircle size={20} />}
            title={errorFeedback?.title}
            description={errorFeedback?.description}
          />
        )}

        {error && !knownErrorCodes.includes(error.code) && (
          <ErrorBanner
            tone="destructive"
            icon={<FiAlertCircle size={20} />}
            title={errorFeedback?.title}
            description={errorFeedback?.description}
          />
        )}

        {success ? (
          <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-6 text-center">
            <FiCheckCircle className="mx-auto mb-3 text-success" size={32} />
            <h3 className="text-base font-bold text-success">Report Submitted</h3>
            <p className="mt-2 text-sm text-success/90">
              Thank you for helping keep our community safe. Our moderation team will
              review this report shortly.
            </p>
          </div>
        ) : (
          <>
            {!user?._id && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                Please log in to submit a report.
              </div>
            )}

            {isSelfReport && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                You cannot report your own content.
              </div>
            )}

            {!error && (
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Select a reason <span className="text-destructive">*</span>
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
                        className={cn(
                          "w-full rounded-xl border px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-1 inline-flex h-4 w-4 rounded-full border-2",
                              selected ? "border-primary bg-primary" : "border-border",
                            )}
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {option.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {touched && !reason && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                    <FiAlertCircle size={14} />
                    Please select a reason
                  </p>
                )}
              </div>
            )}

            {!error && reason === "other" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Please describe the issue <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:bg-muted disabled:opacity-50"
                  rows={3}
                  maxLength={500}
                  placeholder="Please provide details about why you're reporting this..."
                  required
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Required when reason is &quot;Other&quot;</span>
                  <span>{message.length}/500</span>
                </div>
              </div>
            )}

            {!error && reason !== "other" && reason && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Add more context (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:bg-muted disabled:opacity-50"
                  rows={3}
                  maxLength={500}
                  placeholder="Provide any additional details that might help us review this report..."
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Max 500 characters</span>
                  <span>{message.length}/500</span>
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </Modal>
  );
}
