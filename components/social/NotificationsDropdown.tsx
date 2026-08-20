"use client";

import React, { useEffect, useState, useRef } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/api/social/social.api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import VerifiedBadge from "./VerifiedBadge";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export default function NotificationsDropdown() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update unread count when notifications change
  useEffect(() => {
    const count = Array.isArray(notifications)
      ? notifications.filter((n) => n && !(n.isRead || n.read)).length
      : 0;
    setUnreadCount(count);
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Fetch notifications on mount and poll periodically
  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications(1);

    // Then set up polling for background updates every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(1);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens if not already fetched
  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [showDropdown, notifications.length]);

  const fetchNotifications = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getNotifications(page, 10);
      // Correctly map backend response structure
      if (response && response.data) {
        // Backend returns: { data: { notifications: [...], unreadCount, pagination: {...} } }
        const notificationsList = response.data.notifications || [];
        const paginationInfo = response.data.pagination;

        // Normalize isRead to read for consistency
        const normalizedNotifications = notificationsList.map((n: any) => ({
          ...n,
          read: n.isRead ?? n.read ?? false,
        }));

        setNotifications(normalizedNotifications);
        // Calculate total pages from pagination info (total / limit)
        const calculatedTotalPages = paginationInfo?.total
          ? Math.ceil(paginationInfo.total / (paginationInfo?.limit || 10))
          : 1;
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if unread
      const isRead = notification.isRead ?? notification.read ?? false;
      if (!isRead) {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true, read: true } : n,
          ),
        );
      }

      // Navigate based on notification type and available data
      if (notification.post?._id) {
        setShowDropdown(false);
        router.push(`/?postId=${notification.post._id}`);
      } else if (notification.comment?.post) {
        setShowDropdown(false);
        router.push(`/?postId=${notification.comment.post}`);
      } else if (notification.type === "follow") {
        setShowDropdown(false);
        router.push(`/profile/${notification.actor._id}`);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true })),
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkOneAsRead = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation(); // Prevent navigation
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark as read");
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
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full p-2 text-foreground transition-colors hover:bg-secondary cursor-pointer"
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
                  // Ensure actor exists before rendering
                  if (!notification.actor) return null;

                  return (
                    <div
                      key={notification._id}
                      className={cn(
                        "group flex w-full items-start gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/60",
                        !(notification.isRead ?? notification.read) && "bg-primary/5",
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

                        {/* Time */}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </button>

                      {/* Actions: Check button and unread indicator */}
                      <div className="flex shrink-0 items-center gap-2">
                        {!(notification.isRead ?? notification.read) && (
                          <button
                            onClick={(e) => handleMarkOneAsRead(e, notification._id)}
                            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary cursor-pointer"
                            title="Mark as read"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                        {!(notification.isRead ?? notification.read) && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 border-t border-border bg-muted px-4 py-2">
              {Array.from(
                { length: Math.min(totalPages, 3) },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchNotifications(page)}
                  className={cn(
                    "rounded px-3 py-1 text-sm transition-colors cursor-pointer",
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary-hover",
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
