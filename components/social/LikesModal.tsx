"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { User } from "@/lib/api/social/social.api";
import { getPostLikes } from "@/lib/api/social/social.api";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import useAuthStore from "@/stores/user/authStore";
import { useSocialStore } from "@/stores/social/social.store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LikesModalProps {
  postId: string;
  likeCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function LikesModal({
  postId,
  likeCount,
  isOpen,
  onClose,
}: LikesModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toggleUserFollow, followStats } = useSocialStore();

  // Prevent body scroll when modal is open
  useBodyScroll(isOpen);

  const [likes, setLikes] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followingStates, setFollowingStates] = useState<
    Record<string, boolean>
  >({});
  const [followingLoads, setFollowingLoads] = useState<Record<string, boolean>>(
    {},
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch likes on mount or when postId changes
  useEffect(() => {
    if (isOpen && currentPage === 1) {
      fetchLikes(1);
    }
  }, [isOpen, postId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLikes([]);
      setCurrentPage(1);
      setTotalPages(1);
      setFollowingStates({});
      setFollowingLoads({});
    }
  }, [isOpen]);

  const fetchLikes = useCallback(
    async (page: number) => {
      if (page < 1 || (page > totalPages && page !== 1)) return;

      setIsLoading(true);
      try {
        const response = await getPostLikes(postId, page, 20);
        if (response.success && response.data) {
          setLikes((prev) =>
            page === 1
              ? response.data!.likes
              : [...prev, ...response.data!.likes],
          );
          setTotalPages(
            response.data!.pagination.totalPages ??
              response.data!.pagination.pages ??
              1,
          );
          setCurrentPage(page);

          // Initialize following states from the backend response
          const newFollowingStates: Record<string, boolean> = {};
          response.data!.likes.forEach((like) => {
            newFollowingStates[like._id] =
              like.isFollowedByCurrentUser ?? false;
          });
          setFollowingStates((prev) => {
            if (page === 1) {
              return newFollowingStates;
            }
            return { ...prev, ...newFollowingStates };
          });
        }
      } catch (error) {
        console.error("Failed to fetch likes:", error);
        toast.error("Failed to load likes");
      } finally {
        setIsLoading(false);
      }
    },
    [postId, totalPages],
  );

  // Update following states when followStats changes (after user follows/unfollows)
  useEffect(() => {
    if (isOpen && likes.length > 0) {
      const newFollowingStates: Record<string, boolean> = {};
      likes.forEach((like) => {
        // Get the latest state from followStats store
        const stats = followStats.get(like._id);
        const isFollowing =
          stats?.isFollowedByCurrentUser ??
          like.isFollowedByCurrentUser ??
          false;
        newFollowingStates[like._id] = isFollowing;
      });
      setFollowingStates(newFollowingStates);
    }
  }, [followStats, isOpen, likes]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          currentPage < totalPages
        ) {
          fetchLikes(currentPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [currentPage, totalPages, isLoading, fetchLikes]);

  const handleFollow = useCallback(
    async (userId: string, currentFollowing: boolean) => {
      if (!user) {
        toast.error("Please login to follow users");
        router.push("/auth/login");
        return;
      }

      setFollowingLoads((prev) => ({ ...prev, [userId]: true }));
      try {
        await toggleUserFollow(userId);
        // Immediately update the local state
        setFollowingStates((prev) => ({
          ...prev,
          [userId]: !currentFollowing,
        }));
        toast.success(currentFollowing ? "User unfollowed" : "User followed!");
      } catch (error) {
        console.error("Failed to update follow status", error);
        toast.error("Failed to update follow status");
      } finally {
        setFollowingLoads((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [user, toggleUserFollow, router],
  );

  const handleViewProfile = useCallback(
    (userId: string) => {
      onClose();
      router.push(`/profile/${userId}`);
    },
    [router, onClose],
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    {likeCount === 1 ? "1 Like" : `${likeCount} Likes`}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX size={24} className="text-gray-600" />
                  </button>
                </div>

                {/* Likes List */}
                <div className="flex-1 overflow-y-auto">
                  {likes.length === 0 && !isLoading ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      No likes yet
                    </div>
                  ) : (
                    <div>
                      {likes.map((like) => (
                        <div
                          key={like._id}
                          className="px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleViewProfile(like._id)}
                          >
                            <Image
                              src={
                                like.profilePic?.url ||
                                like.avatar ||
                                "/images/default-avatar.png"
                              }
                              alt={like.username}
                              width={40}
                              height={40}
                              className="rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {like.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {like.email}
                              </p>
                            </div>
                          </div>

                          {user?._id !== like._id && (
                            <button
                              onClick={() =>
                                handleFollow(
                                  like._id,
                                  followingStates[like._id] || false,
                                )
                              }
                              disabled={followingLoads[like._id]}
                              className={`ml-3 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                                followingStates[like._id] || false
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                  : "bg-blue-500 text-white hover:bg-blue-600 border border-blue-500"
                              } ${followingLoads[like._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {followingLoads[like._id]
                                ? "..."
                                : followingStates[like._id]
                                  ? "Following"
                                  : "Follow"}
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Loading indicator or end of list */}
                      <div ref={observerTarget} className="p-4 text-center">
                        {isLoading && (
                          <div className="inline-block">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                          </div>
                        )}
                        {!isLoading &&
                          currentPage >= totalPages &&
                          likes.length > 0 && (
                            <p className="text-xs text-gray-400">
                              No more likes
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
