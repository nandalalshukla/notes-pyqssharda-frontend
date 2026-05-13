"use client";

import React, { useEffect, useState, useRef } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import Image from "next/image";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/api/social/social.api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
    const count = notifications.filter((n) => !n.read).length;
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

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [showDropdown, notifications.length]);

  const fetchNotifications = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getNotifications(page, 10);
      if (response.success && response.data) {
        setNotifications(response.data.data);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n,
          ),
        );
      }

      // Navigate based on notification type
      if (notification.targetPost) {
        setShowDropdown(false);
        router.push(`/post/${notification.targetPost}`);
      } else if (notification.targetUser) {
        setShowDropdown(false);
        router.push(`/profile/${notification.targetUser}`);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
      );
      toast.success("Marked as read");
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiBell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <FiBell size={32} className="mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`w-full border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3 px-4 py-3 group ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Actor Avatar */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push(`/profile/${notification.actor._id}`);
                      }}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity rounded-full"
                      title="View profile"
                    >
                      <Image
                        src={
                          notification.actor.profilePic?.url ||
                          notification.actor.avatar ||
                          "/images/default-avatar.png"
                        }
                        alt={notification.actor.username}
                        width={40}
                        height={40}
                        className="rounded-full object-cover cursor-pointer"
                      />
                    </button>

                    {/* Notification Content */}
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                    >
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">
                          {notification.actor.username}
                        </span>{" "}
                        {notification.message}
                      </p>

                      {/* Time */}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </button>

                    {/* Actions: Check button and unread indicator */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) =>
                            handleMarkOneAsRead(e, notification._id)
                          }
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <FiCheck size={18} />
                        </button>
                      )}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-2 flex gap-2 justify-center bg-gray-50">
              {Array.from(
                { length: Math.min(totalPages, 3) },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchNotifications(page)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
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
