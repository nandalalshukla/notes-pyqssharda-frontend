"use client";

import { useState, useMemo } from "react";
import useAuthStore from "@/stores/user/authStore";
import {
  AdminDashboardNew,
  ModeratorDashboard,
  UserDashboard,
} from "@/components/dashboards";
import AuthGuard from "@/components/AuthGuard";
import { Shield, CheckCircle, BookOpen } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();

  // Get initial dashboard based on user role
  const getInitialDashboard = (): string => {
    if (user?.role === "admin") return "admin";
    if (user?.role === "mod") return "moderator";
    return "user";
  };

  const [currentDashboard, setCurrentDashboard] = useState<string>(
    getInitialDashboard(),
  );

  // Determine which dashboards the user can access
  const accessibleDashboards = useMemo(() => {
    if (user?.role === "admin") {
      return [
        {
          id: "admin",
          label: "Admin Dashboard",
          icon: Shield,
          color: "blue",
        },
        {
          id: "moderator",
          label: "Moderator Dashboard",
          icon: CheckCircle,
          color: "red",
        },
        {
          id: "user",
          label: "User Dashboard",
          icon: BookOpen,
          color: "purple",
        },
      ];
    } else if (user?.role === "mod") {
      return [
        {
          id: "moderator",
          label: "Moderator Dashboard",
          icon: CheckCircle,
          color: "red",
        },
        {
          id: "user",
          label: "User Dashboard",
          icon: BookOpen,
          color: "purple",
        },
      ];
    } else {
      return [
        {
          id: "user",
          label: "User Dashboard",
          icon: BookOpen,
          color: "purple",
        },
      ];
    }
  }, [user?.role]);

  const multiDashboard = accessibleDashboards.length > 1;

  // Handle case where user might be null initially (though AuthGuard handles redirect)
  if (!user) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-dvh bg-slate-50">
        {/* Dashboard Switcher - Only show if user has multiple dashboards */}
        {multiDashboard && (
          <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-2 overflow-x-auto py-3 sm:py-4">
                {accessibleDashboards.map((dashboard) => {
                  const IconComponent = dashboard.icon;
                  const isActive = currentDashboard === dashboard.id;

                  const colorMap: Record<
                    string,
                    { bg: string; text: string; gradient: string }
                  > = {
                    blue: {
                      bg: "bg-blue-50",
                      text: "text-blue-700",
                      gradient: "from-blue-500 to-blue-600",
                    },
                    red: {
                      bg: "bg-red-50",
                      text: "text-red-700",
                      gradient: "from-red-500 to-red-600",
                    },
                    purple: {
                      bg: "bg-purple-50",
                      text: "text-purple-700",
                      gradient: "from-purple-500 to-purple-600",
                    },
                  };

                  const colorConfig = colorMap[dashboard.color];

                  return (
                    <button
                      key={dashboard.id}
                      onClick={() => setCurrentDashboard(dashboard.id)}
                      className={`
                        min-w-max px-4 py-2.5 rounded-lg font-semibold text-sm
                        flex items-center gap-2.5 group
                        transition-all duration-200 ease-out
                        ${
                          isActive
                            ? `bg-linear-to-r ${colorConfig.gradient} text-white shadow-lg hover:shadow-xl`
                            : `${colorConfig.bg} ${colorConfig.text} hover:shadow-md border border-slate-200`
                        }
                      `}
                    >
                      <IconComponent
                        size={18}
                        className={`transition-transform ${
                          isActive ? "scale-110" : "group-hover:scale-105"
                        }`}
                      />
                      <span>{dashboard.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="min-h-dvh">
          {currentDashboard === "admin" && user.role === "admin" && (
            <AdminDashboardNew />
          )}
          {currentDashboard === "moderator" &&
            (user.role === "admin" || user.role === "mod") && (
              <ModeratorDashboard />
            )}
          {currentDashboard === "user" &&
            (user.role === "admin" ||
              user.role === "mod" ||
              user.role === "user") && <UserDashboard />}
        </div>
      </div>
    </AuthGuard>
  );
}
