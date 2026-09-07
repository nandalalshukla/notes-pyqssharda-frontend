import { create } from "zustand";
import {
  approvePost,
  getPendingPosts,
  rejectPost,
  type PendingPost,
} from "@/lib/api/mod/mod.api";
import { getErrorMessage } from "@/lib/utils/errorHandler";

/**
 * The review queue for member-submitted events and announcements.
 *
 * Deliberately separate from `submissions.store` rather than a fourth
 * `SubmissionType` alongside note/pyq/syllabus: those three are the same
 * "uploaded file + course metadata" shape and share one table, while a post
 * is body text, media and an author. Folding it in would mean a panel that
 * branches on type for nearly every column.
 */

const cacheTtlMs = 60_000;

interface PendingPostsState {
  entities: Record<string, PendingPost>;
  ids: string[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  /** Keyed by post id while an approve/reject request is in flight. */
  pendingActions: Record<string, "approve" | "reject">;

  fetchPendingPosts: (options?: { force?: boolean }) => Promise<void>;
  approvePendingPost: (postId: string) => Promise<void>;
  rejectPendingPost: (postId: string, reason: string) => Promise<void>;
}

/**
 * Returns a copy of `record` without `key`. A named helper rather than the
 * `const { [key]: _, ...rest }` destructure the other mod stores use —
 * that idiom needs a throwaway binding whose only purpose is to be
 * discarded, and it reads as a puzzle at every call site.
 */
const omitKey = <T,>(record: Record<string, T>, key: string) => {
  const next = { ...record };
  delete next[key];
  return next;
};

const normalizeList = (posts: PendingPost[]) => {
  const entities: Record<string, PendingPost> = {};
  const ids: string[] = [];

  posts.forEach((post) => {
    entities[post._id] = post;
    ids.push(post._id);
  });

  return { entities, ids };
};

export const useModPendingPostsStore = create<PendingPostsState>(
  (set, get) => ({
    entities: {},
    ids: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    pendingActions: {},

    fetchPendingPosts: async (options) => {
      const { lastFetchedAt, ids } = get();
      const shouldUseCache =
        !options?.force &&
        lastFetchedAt !== null &&
        Date.now() - lastFetchedAt < cacheTtlMs &&
        ids.length > 0;

      if (shouldUseCache) return;

      set({ isLoading: true, error: null });

      try {
        const response = await getPendingPosts({
          requestKey: "mod:pending:posts",
          cancelPrevious: true,
          dedupe: true,
        });
        const normalized = normalizeList(response.posts || []);

        set({
          entities: normalized.entities,
          ids: normalized.ids,
          isLoading: false,
          lastFetchedAt: Date.now(),
        });
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
      }
    },

    approvePendingPost: async (postId) => {
      await applyDecision(set, get, postId, "approve", () =>
        approvePost(postId),
      );
    },

    rejectPendingPost: async (postId, reason) => {
      if (!reason.trim()) {
        throw new Error("Rejection reason is required");
      }
      await applyDecision(set, get, postId, "reject", () =>
        rejectPost(postId, reason),
      );
    },
  }),
);

type SetState = (
  partial:
    | Partial<PendingPostsState>
    | ((state: PendingPostsState) => Partial<PendingPostsState>),
) => void;

/**
 * Approve and reject differ only in which request they send: both drop the
 * post out of the queue immediately (the reviewer has decided; leaving the
 * row sitting there invites a double-click into a second request) and both
 * put it back if the request fails.
 */
async function applyDecision(
  set: SetState,
  get: () => PendingPostsState,
  postId: string,
  action: "approve" | "reject",
  request: () => Promise<unknown>,
) {
  if (get().pendingActions[postId]) return;

  const previous = get().entities[postId];
  const previousIds = get().ids;
  if (!previous) return;

  set((state) => ({
    entities: omitKey(state.entities, postId),
    ids: state.ids.filter((id) => id !== postId),
    pendingActions: { ...state.pendingActions, [postId]: action },
  }));

  try {
    await request();
    set((state) => ({
      pendingActions: omitKey(state.pendingActions, postId),
    }));
  } catch (error) {
    set((state) => ({
      entities: { ...state.entities, [postId]: previous },
      ids: previousIds,
      error: getErrorMessage(error),
      pendingActions: omitKey(state.pendingActions, postId),
    }));
    throw error;
  }
}
