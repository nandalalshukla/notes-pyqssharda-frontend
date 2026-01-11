"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import DashboardPage from "@/components/pages/DashboardPage";
import AdminDashboard from "@/components/pages/AdminDashboard";
import ModDashboard from "@/components/pages/ModDashboard";
import AuthGuard from "@/components/AuthGuard";

export default function Dashboard() {
  const { user } = useAuthStore();

  // Handle case where user might be null initially (though AuthGuard handles redirect)
  if (!user) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "mod" && <ModDashboard />}
      {user.role === "user" && <DashboardPage />}
    </AuthGuard>
  );
}
