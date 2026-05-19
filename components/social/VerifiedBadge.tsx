"use client";

import React from "react";

interface VerifiedBadgeProps {
  role?: string | null;
  size?: number;
  className?: string;
}

const verifiedRoleLabels: Record<string, string> = {
  admin: "Admin",
  mod: "Moderator",
};

export const isVerifiedRole = (role?: string | null) =>
  role === "admin" || role === "mod";

const VerifiedBadge = ({
  role,
  size = 16,
  className = "",
}: VerifiedBadgeProps) => {
  const label = role ? verifiedRoleLabels[role] : null;

  if (!label) return null;

  const displaySize = Math.round(size * 1.3);

  return (
    <span
      className={`relative inline-flex items-center group ${className}`}
      aria-label={`Verified ${label}`}
    >
      <svg
        width={displaySize}
        height={displaySize}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          fill="#1D9BF0"
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81C14.67 2.63 13.43 1.75 12 1.75s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
        />
        <path
          fill="#fff"
          d="m10.13 15.48-3.2-3.2 1.74-1.74 1.46 1.46 5.2-5.2 1.74 1.74-6.94 6.94z"
        />
      </svg>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        <span className="block text-sm font-bold text-gray-900">
          Verified {label}
        </span>
        <span className="mt-0.5 block text-xs font-medium text-gray-500">
          Official {label.toLowerCase()} account
        </span>
      </span>
    </span>
  );
};

export default VerifiedBadge;
