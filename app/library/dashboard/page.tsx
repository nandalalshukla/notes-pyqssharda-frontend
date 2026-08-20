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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-dvh bg-background">
        {/* Dashboard Switcher - Only show if user has multiple dashboards */}
        {multiDashboard && (
          <div className="sticky top-0 z-40 border-b border-border bg-card/90 shadow-soft-sm backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex gap-2 overflow-x-auto py-3 sm:py-4">
                {accessibleDashboards.map((dashboard) => {
                  const IconComponent = dashboard.icon;
                  const isActive = currentDashboard === dashboard.id;

                  const colorMap: Record<string, string> = {
                    blue: "primary",
                    red: "coral",
                    purple: "purple",
                  };

                  const accent = colorMap[dashboard.color] ?? "primary";
                  const activeClass =
                    accent === "primary"
                      ? "bg-primary text-primary-foreground shadow-soft-md"
                      : accent === "coral"
                        ? "bg-accent-coral text-accent-coral-foreground shadow-soft-md"
                        : "bg-accent-purple text-accent-purple-foreground shadow-soft-md";
                  const inactiveClass =
                    accent === "primary"
                      ? "bg-primary/10 text-primary hover:shadow-soft-sm border border-border"
                      : accent === "coral"
                        ? "bg-accent-coral/15 text-accent-coral-foreground dark:text-accent-coral hover:shadow-soft-sm border border-border"
                        : "bg-accent-purple/15 text-accent-purple-foreground dark:text-accent-purple hover:shadow-soft-sm border border-border";

                  return (
                    <button
                      key={dashboard.id}
                      onClick={() => setCurrentDashboard(dashboard.id)}
                      className={`
                        min-w-max px-4 py-2.5 rounded-xl font-semibold text-sm
                        flex items-center gap-2.5 group cursor-pointer
                        transition-all duration-200 ease-out
                        ${isActive ? activeClass : inactiveClass}
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
