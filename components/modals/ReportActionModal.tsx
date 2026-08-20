"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Trash2,
  Ban,
  AlertCircle,
  Loader,
  ChevronRight,
} from "lucide-react";
import type { ReportAction, ReportTargetType } from "@/lib/api/mod/mod.api";
import { Modal, Button } from "@/components/ui";

export interface ReportActionModalProps {
  isOpen: boolean;
  action: ReportAction | null;
  targetType: ReportTargetType | null;
  targetInfo?: {
    title?: string;
    author?: string;
    reason?: string;
  };
  isLoading?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

type DangerLevel = "warning" | "danger" | "critical";

const actionConfig: Record<
  ReportAction,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    confirmText: string;
    dangerLevel: DangerLevel;
  }
> = {
  resolve: {
    title: "Approve Report",
    description: "Mark this report as reviewed and valid",
    icon: <AlertCircle className="h-6 w-6" />,
    confirmText: "Approve",
    dangerLevel: "warning",
  },
  reject: {
    title: "Dismiss Report",
    description: "Mark this report as invalid and close it",
    icon: <AlertCircle className="h-6 w-6" />,
    confirmText: "Dismiss",
    dangerLevel: "warning",
  },
  delete_post: {
    title: "Delete Reported Post",
    description:
      "This will permanently remove the post from the platform. This action cannot be undone.",
    icon: <Trash2 className="h-6 w-6" />,
    confirmText: "Delete Post",
    dangerLevel: "danger",
  },
  delete_comment: {
    title: "Delete Reported Comment",
    description:
      "This will permanently remove the comment from the platform. This action cannot be undone.",
    icon: <Trash2 className="h-6 w-6" />,
    confirmText: "Delete Comment",
    dangerLevel: "danger",
  },
  suspend_user: {
    title: "Suspend User",
    description:
      "This user will be temporarily suspended and unable to access the platform. They can be reactivated later.",
    icon: <Ban className="h-6 w-6" />,
    confirmText: "Suspend User",
    dangerLevel: "danger",
  },
  warn_user: {
    title: "Send Warning to User",
    description:
      "This will send a warning message to the user about their behavior. They will be notified.",
    icon: <AlertTriangle className="h-6 w-6" />,
    confirmText: "Send Warning",
    dangerLevel: "warning",
  },
  delete_user: {
    title: "Delete User Account",
    description:
      "This will permanently delete the user account. This action cannot be undone.",
    icon: <AlertTriangle className="h-6 w-6" />,
    confirmText: "Permanently Delete User",
    dangerLevel: "critical",
  },
};

const dangerTextClass: Record<DangerLevel, string> = {
  warning: "text-warning",
  danger: "text-destructive",
  critical: "text-destructive",
};

const dangerButtonVariant: Record<DangerLevel, "primary" | "destructive"> = {
  warning: "primary",
  danger: "destructive",
  critical: "destructive",
};

export const ReportActionModal: React.FC<ReportActionModalProps> = ({
  isOpen,
  action,
  targetType,
  targetInfo,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [confirmCount, setConfirmCount] = useState(0);
  const config = action ? actionConfig[action] : null;

  const isCritical = config?.dangerLevel === "critical";
  const requiresDoubleConfirm = [
    "delete_user",
    "delete_post",
    "delete_comment",
  ].includes(action || "");

  const handleConfirm = async () => {
    if (requiresDoubleConfirm && confirmCount === 0) {
      setConfirmCount(1);
      return;
    }
    try {
      await onConfirm();
      setConfirmCount(0);
    } catch {
      // Error handled by parent
    }
  };

  const handleCancel = () => {
    setConfirmCount(0);
    onCancel();
  };

  if (!config) return null;

  return (
    <Modal
      isOpen={isOpen && !!config}
      onClose={handleCancel}
      size="sm"
      title={
        <span className="flex items-center gap-3">
          <span className={dangerTextClass[config.dangerLevel]}>{config.icon}</span>
          {config.title}
        </span>
      }
      description={
        isCritical ? (
          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" /> Critical Action
          </span>
        ) : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={dangerButtonVariant[config.dangerLevel]}
            onClick={handleConfirm}
            disabled={isLoading}
            icon={
              isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : requiresDoubleConfirm && confirmCount === 0 ? (
                <ChevronRight className="h-4 w-4" />
              ) : undefined
            }
          >
            {isLoading
              ? "Processing..."
              : requiresDoubleConfirm && confirmCount === 0
                ? "Confirm"
                : config.confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className={`text-sm ${dangerTextClass[config.dangerLevel]}`}>
          {config.description}
        </p>

        {targetInfo && (
          <div className="space-y-3 rounded-xl border border-border bg-muted p-4">
            {targetInfo.title && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Content/User:
                </p>
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {targetInfo.title}
                </p>
              </div>
            )}
            {targetType && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Target Type:
                </p>
                <p className="text-sm font-medium text-foreground capitalize">{targetType}</p>
              </div>
            )}
            {targetInfo.author && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Author:
                </p>
                <p className="text-sm font-medium text-foreground">{targetInfo.author}</p>
              </div>
            )}
            {targetInfo.reason && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Report Reason:
                </p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {targetInfo.reason.replace(/_/g, " ")}
                </p>
              </div>
            )}
          </div>
        )}

        {requiresDoubleConfirm && confirmCount === 1 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  {isCritical ? "Are you absolutely sure?" : "Please confirm this action"}
                </p>
                <p className="mt-1 text-xs text-destructive/80">
                  {isCritical
                    ? "This action will permanently delete the user and cannot be reversed."
                    : "This cannot be undone."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
