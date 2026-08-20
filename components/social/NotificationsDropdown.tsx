"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSocialStore } from "@/stores/social/social.store";
import { Notification } from "@/lib/api/social/social.api";
import VerifiedBadge from "./VerifiedBadge";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/**
 * Pure view over useSocialStore's notification slice — no local
 * fetch/polling state of its own. This component mounts twice at once
 * (desktop nav + mobile nav are both always in the DOM, only one visible
 * via CSS at a time), so any fetching/connecting logic here would run
 * twice too; the store's connect/fetch functions are singletons/idempotent
 * specifically so that's safe.
 */
export default function NotificationsDropdown() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  const notifications = useSocialStore((s) => s.notifications);
  const unreadCount = useSocialStore((s) => s.unreadCount);
  const isLoading = useSocialStore((s) => s.isLoadingNotifications);
  const fetchNotifications = useSocialStore((s) => s.fetchNotifications);
  const markOneAsRead = useSocialStore((s) => s.markOneAsRead);
  const markAllAsRead = useSocialStore((s) => s.markAllAsRead);
  const removeNotification = useSocialStore((s) => s.removeNotification);

  // One initial fetch to populate the list; everything after this arrives
  // live over the SSE stream (connected globally off auth state — see
  // social.store.ts), with the store's own polling fallback covering any
  // gap while the stream isn't connected. No interval here.
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleOpenDropdown = () => {
    const next = !showDropdown;
    setShowDropdown(next);
    // Refresh on open in case the stream/poll missed something while closed.
    if (next) fetchNotifications(1);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      markOneAsRead(notification._id).catch(() => {
        toast.error("Failed to mark as read");
      });
    }

    setShowDropdown(false);
    if (notification.post?._id) {
      router.push(`/?postId=${notification.post._id}`);
    } else if (notification.comment?.post) {
      router.push(`/?postId=${notification.comment.post}`);
    } else if (notification.type === "follow") {
      router.push(`/profile/${notification.actor._id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkOneAsRead = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    try {
      await markOneAsRead(notificationId);
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await removeNotification(notificationId);
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const seconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return notifDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationActionText = (notification: Notification) => {
    const actorName = notification.actor?.username;
    if (!actorName) return notification.message;

    const prefix = `${actorName} `;
    return notification.message
      .toLowerCase()
      .startsWith(prefix.toLowerCase())
      ? notification.message.slice(prefix.length).trim()
      : notification.message;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleOpenDropdown}
        className="relative rounded-full p-2 text-foreground transition-colors hover:bg-secondary cursor-pointer"
        aria-label="Notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex min-w-[20px] translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-destructive px-2 py-1 text-xs leading-none font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="fixed inset-x-3 top-16 z-50 flex max-h-[70vh] w-auto flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg md:absolute md:inset-x-auto md:top-full md:right-0 md:mt-2 md:max-h-[600px] md:w-96">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm font-medium text-primary hover:text-primary-hover cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                <FiBell size={32} className="mb-2 text-muted-foreground" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => {
                  if (!notification.actor) return null;

                  return (
                    <div
                      key={notification._id}
                      className={cn(
                        "group flex w-full items-start gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/60",
                        !notification.isRead && "bg-primary/5",
                      )}
                    >
                      {/* Actor Avatar */}
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          router.push(`/profile/${notification.actor._id}`);
                        }}
                        className="shrink-0 rounded-full transition-opacity hover:opacity-80 cursor-pointer"
                        title="View profile"
                      >
                        <Avatar
                          src={notification.actor.profilePic?.url || notification.actor.avatar}
                          alt={notification.actor.username}
                          size="md"
                        />
                      </button>

                      {/* Notification Content */}
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="min-w-0 flex-1 text-left transition-opacity hover:opacity-80 cursor-pointer"
                      >
                        <p className="text-sm text-foreground">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            {notification.actor.username}
                            <VerifiedBadge role={notification.actor.role} size={12} />
                          </span>{" "}
                          {getNotificationActionText(notification)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </button>

                      {/* Actions: mark-read, delete, unread dot */}
                      <div className="flex shrink-0 items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkOneAsRead(e, notification._id)}
                            className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-colors group-hover:opacity-100 hover:bg-secondary hover:text-primary cursor-pointer"
                            title="Mark as read"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification._id)}
                          className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-colors group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        {!notification.isRead && (
                          <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
