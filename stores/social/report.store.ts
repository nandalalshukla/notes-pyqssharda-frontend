import { create } from "zustand";
import {
  submitReport,
  CreateReportPayload,
  ReportTargetType,
  ReportReason,
} from "@/lib/api/social/report.api";
import {
  getReportErrorDetails,
  getReportErrorFeedback,
  ReportError,
} from "@/lib/utils/reportErrorHandler";

const getTargetKey = (targetType: ReportTargetType, targetId: string) =>
  `${targetType}:${targetId}`;

interface ReportState {
  isSubmitting: boolean;
  pendingByTarget: Record<string, boolean>;
  success: boolean;
  error: ReportError | null;
  errorFeedback: {
    title: string;
    description: string;
    actionText?: string;
    retryAfter?: number;
  } | null;
  submitReport: (payload: CreateReportPayload) => Promise<void>;
  reportPost: (
    targetId: string,
    reason: ReportReason,
    message?: string,
  ) => Promise<void>;
  reportComment: (
    targetId: string,
    reason: ReportReason,
    message?: string,
  ) => Promise<void>;
  reportUser: (
    targetId: string,
    reason: ReportReason,
    message?: string,
  ) => Promise<void>;
  isTargetPending: (targetType: ReportTargetType, targetId: string) => boolean;
  resetReportState: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  isSubmitting: false,
  pendingByTarget: {},
  success: false,
  error: null,
  errorFeedback: null,

  isTargetPending: (targetType, targetId) =>
    Boolean(get().pendingByTarget[getTargetKey(targetType, targetId)]),

  submitReport: async (payload) => {
    const targetKey = getTargetKey(payload.targetType, payload.targetId);

    if (get().pendingByTarget[targetKey]) return;

    set((state) => ({
      isSubmitting: true,
      error: null,
      errorFeedback: null,
      success: false,
      pendingByTarget: {
        ...state.pendingByTarget,
        [targetKey]: true,
      },
    }));

    try {
      await submitReport(payload);
      set((state) => ({
        isSubmitting: false,
        success: true,
        error: null,
        errorFeedback: null,
        pendingByTarget: {
          ...state.pendingByTarget,
          [targetKey]: false,
        },
      }));
    } catch (error: unknown) {
      const errorDetails = getReportErrorDetails(error);
      const feedback = getReportErrorFeedback(errorDetails);

      set((state) => ({
        isSubmitting: false,
        success: false,
        error: errorDetails,
        errorFeedback: feedback,
        pendingByTarget: {
          ...state.pendingByTarget,
          [targetKey]: false,
        },
      }));
      throw error;
    }
  },

  reportPost: (targetId, reason, message) =>
    get().submitReport({ targetType: "post", targetId, reason, message }),

  reportComment: (targetId, reason, message) =>
    get().submitReport({ targetType: "comment", targetId, reason, message }),

  reportUser: (targetId, reason, message) =>
    get().submitReport({ targetType: "user", targetId, reason, message }),

  resetReportState: () =>
    set({
      isSubmitting: false,
      success: false,
      error: null,
      errorFeedback: null,
    }),
}));
