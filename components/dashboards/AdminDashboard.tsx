"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import { useAdminUsersStore } from "@/stores/admin/users.store";
import { useAdminModsStore } from "@/stores/admin/mods.store";
import { useAdminModRequestsStore } from "@/stores/admin/modRequests.store";
import { DashboardLayout } from "@/components/dashboards/DashboardLayout";
import { StatsGrid } from "@/components/dashboards/StatCard";
import OverviewPanel from "@/components/dashboards/admin/OverviewPanel";
import UsersPanel from "@/components/dashboards/admin/UsersPanel";
import ContentPanel from "@/components/dashboards/admin/ContentPanel";
import ModsPanel from "@/components/dashboards/admin/ModsPanel";
import RequestsPanel from "@/components/dashboards/admin/RequestsPanel";
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  Activity,
  Library,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeNav, setActiveNav] = useState("overview");

  // Store state
  const {
    userIds,
    userEntities,
    usersLoading,
    usersError,
    userPendingActions,
    fetchUsers,
    deactivateUser,
    activateUser,
    deleteUser,
  } = useAdminUsersStore(
    useShallow((state) => ({
      userIds: state.ids,
      userEntities: state.entities,
      usersLoading: state.isLoading,
      usersError: state.error,
      userPendingActions: state.pendingActions,
      fetchUsers: state.fetchUsers,
      deactivateUser: state.deactivateUser,
      activateUser: state.activateUser,
      deleteUser: state.deleteUser,
    })),
  );

  const {
    modIds,
    modEntities,
    modsLoading,
    modsError,
    modPendingActions,
    fetchMods,
    removeModRole,
  } = useAdminModsStore(
    useShallow((state) => ({
      modIds: state.ids,
      modEntities: state.entities,
      modsLoading: state.isLoading,
      modsError: state.error,
      modPendingActions: state.pendingActions,
      fetchMods: state.fetchMods,
      removeModRole: state.removeModRole,
    })),
  );

  const {
    requestIds,
    requestEntities,
    requestsLoading,
    requestsError,
    requestPendingActions,
    fetchModRequests,
    processModRequest,
  } = useAdminModRequestsStore(
    useShallow((state) => ({
      requestIds: state.ids,
      requestEntities: state.entities,
      requestsLoading: state.isLoading,
      requestsError: state.error,
      requestPendingActions: state.pendingActions,
      fetchModRequests: state.fetchModRequests,
      processModRequest: state.processModRequest,
    })),
  );

  // Data computation
  const users = useMemo(
    () => userIds.map((id) => userEntities[id]).filter(Boolean),
    [userIds, userEntities],
  );

  const mods = useMemo(
    () => modIds.map((id) => modEntities[id]).filter(Boolean),
    [modIds, modEntities],
  );

  const modRequests = useMemo(
    () => requestIds.map((id) => requestEntities[id]).filter(Boolean),
    [requestIds, requestEntities],
  );

  // Stats
  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <Users size={24} />,
      variant: "primary" as const,
      description: "Active and inactive",
    },
    {
      label: "Active Moderators",
      value: mods.filter((m) => m.isActive).length,
      icon: <UserCheck size={24} />,
      variant: "success" as const,
      description: `Out of ${mods.length}`,
    },
    {
      label: "Pending Requests",
      value: modRequests.length,
      icon: <Clock size={24} />,
      variant: "warning" as const,
      description: "Awaiting review",
    },
    {
      label: "Inactive Users",
      value: users.filter((u) => !u.isActive).length,
      icon: <UserX size={24} />,
      variant: "danger" as const,
      description: "Attention needed",
    },
  ];

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchMods();
    fetchModRequests();
  }, []);

  useEffect(() => {
    if (usersError || modsError || requestsError) {
      toast.error(usersError || modsError || requestsError);
    }
  }, [usersError, modsError, requestsError]);

  // Handlers
  const handleToggleUserStatus = async (id: string, isActive: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`,
      )
    )
      return;
    try {
      if (isActive) await deactivateUser(id);
      else await activateUser(id);
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleRemoveModRole = async (id: string) => {
    if (!confirm("Are you sure you want to remove moderator role?")) return;
    try {
      await removeModRole(id);
      toast.success("Moderator role removed");
    } catch (error) {
      toast.error("Failed to remove moderator role");
    }
  };

  const handleProcessModRequest = async (
    id: string,
    action: "approve" | "reject",
  ) => {
    try {
      await processModRequest(id, action);
      toast.success(`Request ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  // Navigation items
  const navItems = [
    {
      id: "overview",
      label: "Dashboard Overview",
      icon: <Activity size={20} />,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} />,
      badge: users.filter((u) => !u.isActive).length,
    },
    {
      id: "mods",
      label: "Moderators",
      icon: <UserCheck size={20} />,
      badge: mods.length,
    },
    {
      id: "content",
      label: "Content",
      icon: <Library size={20} />,
    },
    {
      id: "requests",
      label: "Mod Requests",
      icon: <FileText size={20} />,
      badge: modRequests.length,
    },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      activeNavId={activeNav}
      onNavChange={setActiveNav}
      title="Admin Dashboard"
      subtitle="Manage content, users, moderators and platform health"
      userRole={`${user?.role} • ${user?.name}`}
    >
      {/* Stats Grid - Always visible */}
      <StatsGrid stats={stats} columns={4} />

      {activeNav === "overview" && <OverviewPanel users={users} mods={mods} />}

      {activeNav === "content" && <ContentPanel />}

      {activeNav === "users" && (
        <UsersPanel
          users={users}
          isLoading={usersLoading}
          pendingActions={userPendingActions}
          onToggleStatus={handleToggleUserStatus}
          onDelete={handleDeleteUser}
        />
      )}

      {activeNav === "mods" && (
        <ModsPanel
          mods={mods}
          isLoading={modsLoading}
          pendingActions={modPendingActions}
          onRemoveRole={handleRemoveModRole}
        />
      )}

      {activeNav === "requests" && (
        <RequestsPanel
          requests={modRequests}
          isLoading={requestsLoading}
          pendingActions={requestPendingActions}
          onProcess={handleProcessModRequest}
        />
      )}
    </DashboardLayout>
  );
}
