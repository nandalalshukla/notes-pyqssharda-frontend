import { create } from "zustand";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import {
  getReports,
  ReportListFilters,
  ReportListItem,
  ReportListResponse,
  resolveReport,
  rejectReport,
  deleteReportedPost,
  deleteReportedComment,
  suspendReportedUser,
  warnReportedUser,
  ReportAction,
} from "@/lib/api/mod/mod.api";

const cacheTtlMs = 30_000;

interface ReportsState {
  entities: Record<string, ReportListItem>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  pagination: ReportListResponse["pagination"] | null;
  lastFetchedAt: number | null;
  lastQueryKey: string | null;
  pendingActions: Record<string, ReportAction>;
  fetchReports: (
    filters?: ReportListFilters,
    options?: { force?: boolean },
  ) => Promise<void>;
  applyReportAction: (reportId: string, action: ReportAction) => Promise<void>;
}

const normalizeReports = (reports: ReportListItem[]) => {
  const entities: Record<string, ReportListItem> = {};
  const ids: string[] = [];

  reports.forEach((report) => {
    entities[report._id] = report;
    ids.push(report._id);
  });

  return { entities, ids };
};

const buildQueryKey = (filters?: ReportListFilters) =>
  JSON.stringify({
    status: filters?.status || null,
    targetType: filters?.targetType || null,
    page: filters?.page || 1,
    limit: filters?.limit || 20,
    sortOrder: filters?.sortOrder || "desc",
  });

export const useModReportsStore = create<ReportsState>((set, get) => ({
  entities: {},
  ids: [],
  isLoading: false,
  error: null,
  pagination: null,
  lastFetchedAt: null,
  lastQueryKey: null,
  pendingActions: {},

  fetchReports: async (filters, options) => {
    const queryKey = buildQueryKey(filters);
    const { lastFetchedAt, lastQueryKey, ids } = get();
    const shouldUseCache =
      !options?.force &&
      lastFetchedAt !== null &&
      lastQueryKey === queryKey &&
      Date.now() - lastFetchedAt < cacheTtlMs &&
      ids.length > 0;

    if (shouldUseCache) return;

    set({ isLoading: true, error: null });
    try {
      const response = await getReports(filters, {
        requestKey: `mod:reports:${queryKey}`,
        cancelPrevious: true,
        dedupe: true,
      });
      const normalized = normalizeReports(response.reports || []);

      set({
        ...normalized,
        pagination: response.pagination,
        isLoading: false,
        lastFetchedAt: Date.now(),
        lastQueryKey: queryKey,
      });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  applyReportAction: async (reportId, action) => {
    if (get().pendingActions[reportId]) return;

    const previousReport = get().entities[reportId];
    if (!previousReport) return;

    const optimisticStatus = action === "reject" ? "rejected" : "resolved";

    set((state) => ({
      entities: {
        ...state.entities,
        [reportId]: {
          ...state.entities[reportId],
          status: optimisticStatus,
        },
      },
      pendingActions: { ...state.pendingActions, [reportId]: action },
    }));

    try {
      switch (action) {
        case "resolve":
          await resolveReport(reportId);
          break;
        case "reject":
          await rejectReport(reportId);
          break;
        case "delete_post":
          await deleteReportedPost(reportId);
          break;
        case "delete_comment":
          await deleteReportedComment(reportId);
          break;
        case "suspend_user":
          await suspendReportedUser(reportId);
          break;
        case "warn_user":
          await warnReportedUser(reportId);
          break;
        default:
          break;
      }
      set((state) => {
        const { [reportId]: _, ...rest } = state.pendingActions;
        return { pendingActions: rest };
      });
    } catch (error) {
      const maybeReport =
        (
          error as {
            response?: { data?: { data?: { report?: ReportListItem } } };
          }
        ).response?.data?.data?.report || null;

      set((state) => ({
        entities: {
          ...state.entities,
          [reportId]: maybeReport || previousReport,
        },
        error: getErrorMessage(error),
        pendingActions: Object.fromEntries(
          Object.entries(state.pendingActions).filter(
            ([id]) => id !== reportId,
          ),
        ),
      }));
      throw error;
    }
  },
}));
