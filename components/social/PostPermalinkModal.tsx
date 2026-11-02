"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiAlertCircle, FiLock, FiX } from "react-icons/fi";
import { Button, EmptyState } from "@/components/ui";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { PERMALINK_KEY, useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import { getErrorMessage } from "@/lib/utils/errorHandler";
import PostCard from "./PostCard";
import { PostCardSkeleton } from "./LoadingSkeletons";

type Status = "loading" | "ready" | "missing" | "error";

interface PostPermalinkModalProps {
  postId: string;
  /** Where to go when the modal is dismissed. */
  closeHref?: string;
}

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/**
 * Headless UI parks every dialog in one `#headlessui-portal-root`, and between
 * two things at the same z-index the later one in the DOM wins. Putting this
 * overlay in that same root means it covers the navbar (which comes earlier)
 * yet sits *under* any dialog opened from it later (share, comments…), with no
 * z-index arms race.
 */
function getPortalRoot(): HTMLElement {
  let root = document.getElementById("headlessui-portal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "headlessui-portal-root";
    document.body.appendChild(root);
  }
  return root;
}

/**
 * A single post, opened over the feed from a shared link.
 *
 * The post goes through the same store and PostCard as everything in the
 * feed, so likes, comments, follow, report, edit and delete all work exactly
 * as they do there — and the share button can re-share it onward.
 *
 * This is a plain overlay rather than the site's Headless UI `Modal` on
 * purpose. PostCard opens its own dialogs (share, comments, report, delete),
 * and Headless UI closes a dialog it decides has "disappeared" — which it did
 * to this one whenever a second dialog opened on top of it. As an ordinary
 * overlay, those dialogs are independent top-level ones and cannot close it.
 */
export default function PostPermalinkModal({ postId, closeHref = "/" }: PostPermalinkModalProps) {
  const router = useRouter();
  const authInitialized = useAuthStore((s) => s.authInitialized);
  const loadPermalinkPost = useSocialStore((s) => s.loadPermalinkPost);
  const clearPermalinkPost = useSocialStore((s) => s.clearPermalinkPost);
  const post = useSocialStore((s) => s.userPosts.get(PERMALINK_KEY)?.[0]);
  // True while a store action (e.g. deleting this very post) is in flight.
  const storeBusy = useSocialStore((s) => s.isLoading);

  const [isOpen, setIsOpen] = useState(true);
  const [loadStatus, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const hasLoaded = useRef(false);
  const rechecking = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // A malformed id can never load, so say so without asking the server.
  const status: Status = OBJECT_ID.test(postId) ? loadStatus : "missing";

  useBodyScroll(isOpen);

  const close = useCallback(() => {
    setIsOpen(false);
    router.replace(closeHref);
  }, [router, closeHref]);

  const retry = () => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  };

  const isNotFound = (error: unknown) =>
    axios.isAxiosError(error) && [400, 404].includes(error.response?.status ?? 0);

  // Wait until we know who is signed in, so the post arrives with the right
  // "liked by you" state instead of flashing as a guest's view.
  useEffect(() => {
    if (!authInitialized || !OBJECT_ID.test(postId)) return;

    let cancelled = false;
    hasLoaded.current = false;

    loadPermalinkPost(postId)
      .then(() => {
        if (cancelled) return;
        hasLoaded.current = true;
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(getErrorMessage(error));
        setStatus(isNotFound(error) ? "missing" : "error");
      });

    return () => {
      cancelled = true;
      // Disarm the "vanished?" check below *before* clearing: this clear is
      // us tidying up, not the post disappearing.
      hasLoaded.current = false;
      clearPermalinkPost();
    };
  }, [postId, authInitialized, attempt, loadPermalinkPost, clearPermalinkPost]);

  // If the post drops out of the store while we're showing it, find out why
  // rather than guessing. The author may have deleted it (the server now says
  // 404, so close), or something reset the store (the post is still there, so
  // put it back). Waits for any in-flight delete to settle first, otherwise
  // the re-check could race it and resurrect a post that is mid-deletion.
  useEffect(() => {
    if (status !== "ready" || post || storeBusy || !hasLoaded.current || rechecking.current) return;
    rechecking.current = true;
    loadPermalinkPost(postId)
      .catch((error: unknown) => {
        if (isNotFound(error)) close();
        else {
          setErrorMessage(getErrorMessage(error));
          setStatus("error");
        }
      })
      .finally(() => {
        rechecking.current = false;
      });
  }, [status, post, storeBusy, postId, loadPermalinkPost, close]);

  // Escape closes — unless a dialog opened from the post (share, comments,
  // report…) is on top, in which case Escape belongs to that one.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // This overlay lives in the same portal root, so it has to ignore itself.
      const other = Array.from(
        document.querySelectorAll('#headlessui-portal-root [role="dialog"]'),
      ).some((dialog) => dialog !== panelRef.current);
      if (other) return;
      close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  // Move focus into the dialog, and give it back to wherever it came from.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previous?.focus?.();
  }, [isOpen]);

  // False on the server and during hydration, true afterwards — so the portal
  // is never part of the server HTML and cannot cause a hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Post"
        tabIndex={-1}
        className="animate-fade-in-up relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-soft-lg outline-none"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-lg font-bold text-foreground">Post</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close post"
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain bg-background p-3 sm:p-4">
          {(status === "loading" || (status === "ready" && !post)) && (
            <div aria-busy="true" aria-live="polite">
              <PostCardSkeleton />
            </div>
          )}

          {status === "ready" && post && <PostCard post={post} />}

          {status === "missing" && (
            <EmptyState
              icon={<FiLock size={28} />}
              title="This post isn't available"
              description="It may have been deleted, or it's still waiting for a moderator to approve it."
              action={<Button onClick={close}>Go to the feed</Button>}
              className="border-0 py-12"
            />
          )}

          {status === "error" && (
            <EmptyState
              icon={<FiAlertCircle size={28} />}
              title="Couldn't load this post"
              description={errorMessage || "Please check your connection and try again."}
              action={
                <div className="flex gap-3">
                  <Button variant="outline" onClick={close}>
                    Close
                  </Button>
                  <Button onClick={retry}>Try again</Button>
                </div>
              }
              className="border-0 py-12"
            />
          )}
        </div>
      </div>
    </div>,
    getPortalRoot(),
  );
}
