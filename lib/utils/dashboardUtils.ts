/**
 * Dashboard utility functions for common operations
 */

import { ReactNode } from "react";

// Type guards and validators
export const isActiveStatus = (status: string): boolean => {
  return status === "active" || status === "approved";
};

export const isPendingStatus = (status: string): boolean => {
  return status === "pending";
};

export const isRejectedStatus = (status: string): boolean => {
  return status === "rejected" || status === "inactive";
};

// Status badge helpers
export interface StatusBadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon?: ReactNode;
}

export const getStatusBadgeConfig = (status: string): StatusBadgeConfig => {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
      };
    case "pending":
      return {
        label: "Pending",
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
      };
    case "inactive":
    case "rejected":
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        bgColor: "bg-red-100",
        textColor: "text-red-700",
      };
    default:
      return {
        label: status,
        bgColor: "bg-slate-100",
        textColor: "text-slate-700",
      };
  }
};

// Date helpers
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
};

// Number formatters
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Text helpers
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Data transformation
export const groupBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
): Record<string, T[]> => {
  return arr.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
};

export const sortBy = <T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc",
): T[] => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterBy = <T extends Record<string, any>>(
  arr: T[],
  filters: Record<string, any>,
): T[] => {
  return arr.filter((item) =>
    Object.entries(filters).every(([key, value]) => item[key] === value),
  );
};

// Export utilities for action menus
export const downloadCSV = (data: any[], filename: string): void => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return "";

  const keys = Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      })
      .join(","),
  );

  return [header, ...rows].join("\n");
};

// Pagination helper
export const getPaginationItems = (
  totalPages: number,
  currentPage: number,
  maxVisible: number = 5,
): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= Math.ceil(maxVisible / 2)) {
      for (let i = 1; i <= maxVisible - 1; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("...");
      const start = currentPage - Math.floor(maxVisible / 2);
      for (let i = start; i < start + maxVisible - 3; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    }
  }

  return pages;
};

// Confirmation dialog helper
export const confirmAction = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined") {
      resolve(window.confirm(message));
    }
  });
};

// Toast message types
export type ToastType = "success" | "error" | "warning" | "info";

export const toastMessages = {
  success: (message: string) => ({ type: "success" as ToastType, message }),
  error: (message: string) => ({ type: "error" as ToastType, message }),
  warning: (message: string) => ({ type: "warning" as ToastType, message }),
  info: (message: string) => ({ type: "info" as ToastType, message }),
};

// Common messages
export const commonMessages = {
  delete: "⚠️ This action cannot be undone. Are you sure?",
  deactivate: "Are you sure you want to deactivate this item?",
  activate: "Are you sure you want to activate this item?",
  approve: "Do you want to approve this request?",
  reject: "Do you want to reject this request?",
  loading: "Loading...",
  saving: "Saving...",
  deleting: "Deleting...",
  approving: "Approving...",
  rejecting: "Rejecting...",
};

// Role-based display names
export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    mod: "Moderator",
    user: "User",
  };
  return roleMap[role] || capitalizeFirstLetter(role);
};

// Content type display
export const getContentTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    note: "📝 Study Notes",
    pyq: "❓ Previous Year Questions",
    syllabus: "📋 Course Syllabus",
  };
  return typeMap[type] || capitalizeFirstLetter(type);
};
