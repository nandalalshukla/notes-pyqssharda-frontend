"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Trash2,
  Ban,
  AlertCircle,
  Loader,
  X,
  ChevronRight,
} from "lucide-react";
import type { ReportAction, ReportTargetType } from "@/lib/api/mod/mod.api";

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

const actionConfig: Record<
  ReportAction,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    confirmText: string;
    dangerLevel: "warning" | "danger" | "critical";
    backgroundColor: string;
    borderColor: string;
    buttonColor: string;
    textColor: string;
  }
> = {
  resolve: {
    title: "Approve Report",
    description: "Mark this report as reviewed and valid",
    icon: <AlertCircle className="w-6 h-6" />,
    confirmText: "Approve",
    dangerLevel: "warning",
    backgroundColor: "bg-blue-50",
    borderColor: "border-blue-200",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    textColor: "text-blue-900",
  },
  reject: {
    title: "Dismiss Report",
    description: "Mark this report as invalid and close it",
    icon: <AlertCircle className="w-6 h-6" />,
    confirmText: "Dismiss",
    dangerLevel: "warning",
    backgroundColor: "bg-amber-50",
    borderColor: "border-amber-200",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    textColor: "text-amber-900",
  },
  delete_post: {
    title: "Delete Reported Post",
    description:
      "This will permanently remove the post from the platform. This action cannot be undone.",
    icon: <Trash2 className="w-6 h-6" />,
    confirmText: "Delete Post",
    dangerLevel: "danger",
    backgroundColor: "bg-red-50",
    borderColor: "border-red-200",
    buttonColor: "bg-red-600 hover:bg-red-700",
    textColor: "text-red-900",
  },
  delete_comment: {
    title: "Delete Reported Comment",
    description:
      "This will permanently remove the comment from the platform. This action cannot be undone.",
    icon: <Trash2 className="w-6 h-6" />,
    confirmText: "Delete Comment",
    dangerLevel: "danger",
    backgroundColor: "bg-red-50",
    borderColor: "border-red-200",
    buttonColor: "bg-red-600 hover:bg-red-700",
    textColor: "text-red-900",
  },
  suspend_user: {
    title: "Suspend User",
    description:
      "This user will be temporarily suspended and unable to access the platform. They can be reactivated later.",
    icon: <Ban className="w-6 h-6" />,
    confirmText: "Suspend User",
    dangerLevel: "danger",
    backgroundColor: "bg-orange-50",
    borderColor: "border-orange-200",
    buttonColor: "bg-orange-600 hover:bg-orange-700",
    textColor: "text-orange-900",
  },
  warn_user: {
    title: "Send Warning to User",
    description:
      "This will send a warning message to the user about their behavior. They will be notified.",
    icon: <AlertTriangle className="w-6 h-6" />,
    confirmText: "Send Warning",
    dangerLevel: "warning",
    backgroundColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    textColor: "text-yellow-900",
  },
  delete_user: {
    title: "Delete User Account",
    description:
      "This will permanently delete the user account and ALL associated data. This action CANNOT be undone.",
    icon: <AlertTriangle className="w-6 h-6" />,
    confirmText: "Permanently Delete User",
    dangerLevel: "critical",
    backgroundColor: "bg-red-50",
    borderColor: "border-red-200",
    buttonColor: "bg-red-700 hover:bg-red-800",
    textColor: "text-red-900",
  },
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

  return (
    <AnimatePresence>
      {isOpen && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${config.backgroundColor} ${config.borderColor} w-full max-w-md rounded-lg border-2 shadow-xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`${config.textColor}`}>{config.icon}</div>
                <div>
                  <h2 className={`text-lg font-semibold ${config.textColor}`}>
                    {config.title}
                  </h2>
                  {isCritical && (
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Critical Action
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-white/50 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <p className={`text-sm ${config.textColor}`}>
                {config.description}
              </p>

              {/* Target Info */}
              {targetInfo && (
                <div className="bg-white/50 rounded p-3 space-y-2">
                  {targetInfo.title && (
                    <div>
                      <p className="text-xs text-gray-600">Content/User:</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {targetInfo.title}
                      </p>
                    </div>
                  )}
                  {targetInfo.author && (
                    <div>
                      <p className="text-xs text-gray-600">Author:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {targetInfo.author}
                      </p>
                    </div>
                  )}
                  {targetInfo.reason && (
                    <div>
                      <p className="text-xs text-gray-600">Report Reason:</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {targetInfo.reason.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Double Confirmation for Dangerous Actions */}
              {requiresDoubleConfirm && confirmCount === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-300 rounded p-4 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">
                        {isCritical
                          ? "Are you absolutely sure?"
                          : "Please confirm this action"}
                      </p>
                      <p className="text-red-800 text-xs mt-1">
                        {isCritical
                          ? "This action will permanently delete the user and cannot be reversed."
                          : "This cannot be undone."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer - Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded ${config.buttonColor} text-white disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2`}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  requiresDoubleConfirm &&
                  confirmCount === 0 && <ChevronRight className="w-4 h-4" />
                )}
                {isLoading
                  ? "Processing..."
                  : requiresDoubleConfirm && confirmCount === 0
                    ? "Confirm"
                    : config.confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
