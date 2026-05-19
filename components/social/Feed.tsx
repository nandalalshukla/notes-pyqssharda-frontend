"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSocialStore } from "@/stores/social/social.store";
import useAuthStore from "@/stores/user/authStore";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { FeedLoadingState } from "./LoadingSkeletons";
import { FiPlus, FiUsers, FiFileText, FiTrendingUp, FiClock, FiAward } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const SORT_OPTIONS = [
  { label: "Best", icon: FiAward },
  { label: "New", icon: FiClock },
  { label: "Top", icon: FiTrendingUp },
];

export default function Feed() {
  const { isAuthenticated, user } = useAuthStore();
  const { feed, feedTotalPages, isLoadingFeed, fetchFeed, error } = useSocialStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSort, setActiveSort] = useState("Best");

  useEffect(() => { fetchFeed(currentPage); }, [currentPage, fetchFeed]);
  useEffect(() => { fetchFeed(1); setCurrentPage(1); }, [isAuthenticated, fetchFeed]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < feedTotalPages) setCurrentPage((p) => p + 1);
  }, [currentPage, feedTotalPages]);

  const authorImage = (user as { profilePic?: { url?: string } } | null)?.profilePic?.url || "";

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--paper-bg)" }}>

      {/* ── Create post bar (shown when authenticated) ── */}
      {isAuthenticated && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-3 mt-4"
          style={{
            background: "var(--paper-surface)",
            border: "1.5px solid rgba(15,15,15,0.08)",
          }}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border flex-shrink-0"
            style={{ borderColor: "rgba(15,15,15,0.12)" }}>
            <Image
              src={authorImage || "/images/default-avatar.png"}
              alt="You"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left px-4 py-2 rounded-xl text-sm transition-colors"
            style={{
              background: "var(--paper-bg)",
              border: "1.5px solid rgba(15,15,15,0.1)",
              color: "var(--muted-ink)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(15,15,15,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(15,15,15,0.1)")}
          >
            Create post…
          </button>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
            style={{ background: "var(--primary-blue)" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Create new post"
          >
            <FiPlus size={15} />
            <span className="hidden sm:inline">Post</span>
          </motion.button>
        </div>
      )}

      {/* ── Sort bar ── */}
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-2xl mb-3"
        style={{
          background: "var(--paper-surface)",
          border: "1.5px solid rgba(15,15,15,0.08)",
        }}
      >
        {SORT_OPTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveSort(label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeSort === label ? "rgba(15,15,15,0.07)" : "transparent",
              color: activeSort === label ? "var(--ink)" : "var(--muted-ink)",
            }}
          >
            <Icon size={14} strokeWidth={activeSort === label ? 2.5 : 1.8} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Auth Prompt ── */}
      {!isAuthenticated && (
        <motion.div
          className="rounded-2xl p-6 mb-3 text-center"
          style={{
            background: "var(--paper-surface)",
            border: "1.5px solid rgba(15,15,15,0.08)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "#eff6ff", border: "1.5px solid rgba(37,99,235,0.3)" }}
          >
            <FiUsers size={22} style={{ color: "var(--primary-blue)" }} />
          </div>
          <h2 className="text-base font-bold mb-1" style={{ color: "var(--ink)" }}>
            Join the conversation
          </h2>
          <p className="text-xs mb-4" style={{ color: "var(--muted-ink)" }}>
            Sign in to post, comment, and connect with the Sharda community.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/auth/login" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.8125rem" }}>
              Login
            </Link>
            <Link href="/auth/register" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.8125rem" }}>
              Register
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl p-5 mb-3 text-center"
          style={{ background: "#fff5f5", border: "1.5px solid #fca5a5" }}>
          <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>{error}</p>
        </div>
      )}

      {/* ── Posts ── */}
      {isLoadingFeed && feed.length === 0 ? (
        <FeedLoadingState />
      ) : feed.length > 0 ? (
        <>
          <div className="space-y-2">
            {feed.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
              >
                <PostCard post={post} isAboveFold={index < 2} />
              </motion.div>
            ))}
          </div>

          {/* Load more */}
          {feedTotalPages > currentPage && (
            <div className="flex justify-center pt-5">
              <motion.button
                onClick={handleLoadMore}
                disabled={isLoadingFeed}
                className="px-6 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "var(--paper-surface)",
                  border: "1.5px solid rgba(15,15,15,0.12)",
                  color: "var(--ink)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoadingFeed ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "var(--ink)", borderTopColor: "transparent" }} />
                    Loading…
                  </span>
                ) : "Load more"}
              </motion.button>
            </div>
          )}

          {/* End of feed */}
          {currentPage === feedTotalPages && feed.length > 0 && (
            <p className="text-center text-xs py-8" style={{ color: "var(--muted-ink)" }}>
              You&apos;re all caught up ✨
            </p>
          )}
        </>
      ) : (
        /* Empty state */
        <motion.div
          className="rounded-2xl text-center py-14 px-6"
          style={{ background: "var(--paper-surface)", border: "1.5px solid rgba(15,15,15,0.08)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--paper-bg)", border: "1.5px solid rgba(15,15,15,0.1)" }}>
            <FiFileText size={22} style={{ color: "var(--muted-ink)" }} />
          </div>
          <h2 className="text-base font-bold mb-1.5" style={{ color: "var(--ink)" }}>No posts yet</h2>
          <p className="text-xs mb-5" style={{ color: "var(--muted-ink)" }}>
            Be the first to share something with the community!
          </p>
          {isAuthenticated && (
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ padding: "8px 24px", fontSize: "0.8125rem" }}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1 }}
            >
              <FiPlus size={14} /> Create Post
            </motion.button>
          )}
        </motion.div>
      )}

      <CreatePostModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
