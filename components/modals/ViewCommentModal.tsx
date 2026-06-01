"use client";

import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { getComment, Comment } from "@/lib/api/social/social.api";
import { X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import VerifiedBadge from "../social/VerifiedBadge";

interface ViewCommentModalProps {
  postId: string;
  commentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewCommentModal({
  postId,
  commentId,
  isOpen,
  onClose,
}: ViewCommentModalProps) {
  const [comment, setComment] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !postId || !commentId) return;

    const fetchComment = async () => {
      setIsLoading(true);
      try {
        const response = await getComment(postId, commentId);
        setComment(response.data?.comment || null);
      } catch (error) {
        toast.error("Failed to load comment");
        console.error("Error fetching comment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComment();
  }, [isOpen, postId, commentId]);

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
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    View Comment
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1 hover:bg-slate-100"
                  >
                    <X size={24} className="text-slate-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
                    </div>
                  ) : comment ? (
                    <div className="space-y-4">
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                          {comment.author?.profilePic?.url && (
                            <Image
                              src={comment.author.profilePic.url}
                              alt={comment.author.username}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/profile/${comment.author._id}`}
                              className="font-semibold text-slate-900 hover:underline"
                            >
                              {comment.author.username}
                            </Link>
                            <VerifiedBadge role={comment.author.role} />
                          </div>
                          <p className="text-sm text-slate-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Badge */}
                      <div>
                        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Comment
                        </span>
                      </div>

                      {/* Comment Text */}
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap break-words text-slate-900">
                          {comment.text}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                        <span>{comment.likes} likes</span>
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link
                          href={`/#post-${comment.post}`}
                          className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                          View Post
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      Comment not found or has been deleted
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
