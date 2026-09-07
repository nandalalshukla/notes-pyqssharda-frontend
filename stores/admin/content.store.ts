import { create } from "zustand";
import {
  approveContent,
  deleteContent,
  getContentCounts,
  listContent,
  rejectContent,
  type AdminContentItem,
  type ContentCounts,
  type ContentPagination,
  type ContentStatusFilter,
  type ContentType,
} from "@/lib/api/admin/content.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

/**
 * Admin content console state.
 *
 * Only ever holds the page currently on screen. The old admin endpoint
 * returned every approved document in one array, which for PYQs is now
 * over five thousand rows — filtering and paging belong in MongoDB, not in
 * the browser's memory.
 *
 * State is keyed by resource type so switching tabs doesn't discard the
 * page you were looking at, and the counts each tab badges itself with are
 * fetched alongside the list.
 */

export type ContentAction = "approve" | "reject" | "delete";

interface TypeState {
  items: AdminContentItem[];
  pagination: ContentPagination;
  counts: ContentCounts;
  isLoading: boolean;
  error: string | null;
}

const emptyTypeState = (): TypeState => ({
  items: [],
  pagination: { page: 1, limit: 25, total: 0, totalPages: 0, hasMore: false },
  counts: { pending: 0, approved: 0, rejected: 0, all: 0 },
  isLoading: false,
  error: null,
});

interface ContentState {
  byType: Record<ContentType, TypeState>;
  /** Keyed `${type}:${id}` while an action is in flight, so one row's
   *  buttons disable without freezing the whole table. */
  pendingActions: Record<string, ContentAction>;

  fetchContent: (
    type: ContentType,
    params: { status: ContentStatusFilter; page: number; query?: string },
  ) => Promise<void>;
  approve: (type: ContentType, id: string) => Promise<void>;
  reject: (type: ContentType, id: string, reason: string) => Promise<void>;
  remove: (type: ContentType, id: string) => Promise<void>;
}

export const actionKey = (type: ContentType, id: string) => `${type}:${id}`;

export const useAdminContentStore = create<ContentState>((set, get) => ({
  byType: {
    notes: emptyTypeState(),
    pyqs: emptyTypeState(),
    syllabus: emptyTypeState(),
  },
  pendingActions: {},

  fetchContent: async (type, params) => {
    set((s) => ({
      byType: {
        ...s.byType,
        [type]: { ...s.byType[type], isLoading: true, error: null },
      },
    }));

    try {
      // The list and its badge counts are always rendered together, so
      // fetching them together avoids the tab showing a count that
      // disagrees with the rows beneath it.
      const [list, counts] = await Promise.all([
        listContent(type, {
          status: params.status,
          page: params.page,
          limit: 25,
          query: params.query || undefined,
        }),
        getContentCounts(type),
      ]);

      set((s) => ({
        byType: {
          ...s.byType,
          [type]: {
            items: list.items,
            pagination: list.pagination,
            counts,
            isLoading: false,
            error: null,
          },
        },
      }));
    } catch (error) {
      set((s) => ({
        byType: {
          ...s.byType,
          [type]: {
            ...s.byType[type],
            isLoading: false,
            error: getErrorMessage(error),
          },
        },
      }));
    }
  },

  approve: async (type, id) =>
    runAction(set, get, type, id, "approve", () => approveContent(type, id)),

  reject: async (type, id, reason) => {
    if (!reason.trim()) throw new Error("A rejection reason is required");
    return runAction(set, get, type, id, "reject", () =>
      rejectContent(type, id, reason),
    );
  },

  remove: async (type, id) =>
    runAction(set, get, type, id, "delete", () => deleteContent(type, id)),
}));

type SetState = (
  partial: Partial<ContentState> | ((s: ContentState) => Partial<ContentState>),
) => void;

/**
 * Approve, reject and delete differ only in the request they send.
 *
 * All three drop the row from the table immediately — the admin has
 * decided, and leaving it in place invites a second click on something
 * already actioned — and all three put it back if the request fails.
 * Counts are adjusted optimistically too, so the tab badges don't lag a
 * refetch behind the rows.
 */
async function runAction(
  set: SetState,
  get: () => ContentState,
  type: ContentType,
  id: string,
  action: ContentAction,
  request: () => Promise<unknown>,
) {
  const key = actionKey(type, id);
  if (get().pendingActions[key]) return;

  const before = get().byType[type];
  const row = before.items.find((i) => i._id === id);
  if (!row) return;

  set((s) => ({
    byType: {
      ...s.byType,
      [type]: {
        ...s.byType[type],
        items: s.byType[type].items.filter((i) => i._id !== id),
        counts: adjustCounts(s.byType[type].counts, row.status, action),
        pagination: {
          ...s.byType[type].pagination,
          total: Math.max(0, s.byType[type].pagination.total - 1),
        },
      },
    },
    pendingActions: { ...s.pendingActions, [key]: action },
  }));

  try {
    await request();
    set((s) => ({ pendingActions: omit(s.pendingActions, key) }));
  } catch (error) {
    // Put the row back exactly as it was, including the counts.
    set((s) => ({
      byType: { ...s.byType, [type]: { ...before, error: getErrorMessage(error) } },
      pendingActions: omit(s.pendingActions, key),
    }));
    throw error;
  }
}

/** The badge totals after a row leaves its current status. */
function adjustCounts(
  counts: ContentCounts,
  from: AdminContentItem["status"],
  action: ContentAction,
): ContentCounts {
  const next = { ...counts };
  if (next[from] > 0) next[from] -= 1;

  if (action === "approve") next.approved += 1;
  else if (action === "reject") next.rejected += 1;
  // A delete removes the row entirely, so nothing gains it and the
  // all-statuses total drops.
  else next.all = Math.max(0, next.all - 1);

  return next;
}

function omit<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}
