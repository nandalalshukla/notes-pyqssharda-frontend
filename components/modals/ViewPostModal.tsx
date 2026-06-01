"use client";

import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { getPost, Post } from "@/lib/api/social/social.api";
import { X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import VerifiedBadge from "../social/VerifiedBadge";

interface ViewPostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewPostModal({
  postId,
  isOpen,
  onClose,
}: ViewPostModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !postId) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await getPost(postId);
        setPost(response.data?.post || null);
      } catch (error) {
        toast.error("Failed to load post");
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [isOpen, postId]);

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
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    View Post
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
                  ) : post ? (
                    <div className="space-y-4">
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                          {post.author?.profilePic?.url && (
                            <Image
                              src={post.author.profilePic.url}
                              alt={post.author.username}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/profile/${post.author._id}`}
                              className="font-semibold text-slate-900 hover:underline"
                            >
                              {post.author.username}
                            </Link>
                            <VerifiedBadge role={post.author.role} />
                          </div>
                          <p className="text-sm text-slate-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Post Type Badge */}
                      <div>
                        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                          {post.type}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap break-words text-slate-900">
                          {post.content}
                        </p>
                      </div>

                      {/* Media */}
                      {post.files && post.files.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {post.files.map((file, idx) => (
                            <div
                              key={idx}
                              className="relative overflow-hidden rounded-lg bg-slate-100"
                            >
                              <Image
                                src={file}
                                alt={`Post media ${idx + 1}`}
                                width={400}
                                height={300}
                                className="aspect-video object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex gap-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                        <span>{post.likes} likes</span>
                        <span>{post.commentCount} comments</span>
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link
                          href={`/#post-${post._id}`}
                          className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                          View in Feed
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      Post not found or has been deleted
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
