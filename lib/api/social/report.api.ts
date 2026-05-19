import api from "../axios";
import type { ApiResponse } from "../types";
import type {
  CreateReportPayload,
  ReportReason,
  ReportTargetType,
} from "./social.api";

export type { CreateReportPayload, ReportReason, ReportTargetType };

export const submitReport = async (payload: CreateReportPayload) => {
  const response = await api.post<ApiResponse<{ report: unknown }>>(
    "/social/reports",
    payload,
  );
  return response.data;
};
