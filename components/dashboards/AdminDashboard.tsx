"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import { useAdminUsersStore } from "@/stores/admin/users.store";
import { useAdminModsStore } from "@/stores/admin/mods.store";
import { useAdminModRequestsStore } from "@/stores/admin/modRequests.store";
import { DashboardLayout } from "@/components/dashboards/DashboardLayout";
import { StatCard, StatsGrid } from "@/components/dashboards/StatCard";
import { DataTable, DataTableColumn } from "@/components/dashboards/DataTable";
import DetailPanel, { DetailField } from "@/components/dashboards/DetailPanel";
import {
  SectionCard,
  Tabs,
  Toolbar,
} from "@/components/dashboards/SectionCard";
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import type { AdminUser } from "@/stores/admin/users.store";
import type { ModRequest } from "@/stores/admin/modRequests.store";

export default function AdminDashboardNew() {
  const { user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedMod, setSelectedMod] = useState<AdminUser | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ModRequest | null>(
    null,
  );
  const [userSearch, setUserSearch] = useState("");
  const [modSearch, setModSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");

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

  // Filtered data
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase()),
      ),
    [users, userSearch],
  );

  const filteredMods = useMemo(
    () =>
      mods.filter(
        (u) =>
          u.name.toLowerCase().includes(modSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(modSearch.toLowerCase()),
      ),
    [mods, modSearch],
  );

  const filteredRequests = useMemo(
    () =>
      modRequests.filter(
        (r) =>
          r.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
          r.email.toLowerCase().includes(requestSearch.toLowerCase()),
      ),
    [modRequests, requestSearch],
  );

  // Stats
  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <Users size={24} />,
      variant: "primary" as const,
      description: "Active and inactive users",
    },
    {
      label: "Active Moderators",
      value: mods.filter((m) => m.isActive).length,
      icon: <UserCheck size={24} />,
      variant: "success" as const,
      description: `Out of ${mods.length} total`,
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
      description: "Requiring attention",
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
      if (selectedUser?._id === id) {
        const updated = userEntities[id];
        setSelectedUser(updated);
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("⚠️ Permanently delete this user and all their data?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleRemoveModRole = async (id: string) => {
    if (!confirm("Are you sure you want to remove moderator role?")) return;
    try {
      await removeModRole(id);
      toast.success("Moderator role removed");
      setSelectedMod(null);
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
      toast.success(`Request ${action}ed`);
      setSelectedRequest(null);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  // Table columns
  const userColumns: DataTableColumn<AdminUser>[] = [
    {
      id: "name",
      header: "User",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "role",
      header: "Role",
      accessor: (row) => (
        <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
          {row.role}
        </span>
      ),
    },
    {
      id: "contributions",
      header: "Contributions",
      accessor: (row) => (
        <span className="font-medium">{row.contributions || 0}</span>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
            row.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const modColumns: DataTableColumn<AdminUser>[] = [
    {
      id: "name",
      header: "Moderator",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "contributions",
      header: "Contributions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600" />
          <span className="font-medium">{row.contributions || 0}</span>
        </div>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
            row.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const requestColumns: DataTableColumn<ModRequest>[] = [
    {
      id: "name",
      header: "Requester",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "motivation",
      header: "Motivation",
      accessor: (row) => (
        <p className="text-sm text-slate-600 line-clamp-2">
          {row.modMotivation || "—"}
        </p>
      ),
    },
    {
      id: "date",
      header: "Requested",
      accessor: (row) => (
        <span className="text-sm text-slate-600">
          {new Date(row.modRequestAt || "").toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
  ];

  // Navigation items
  const navItems = [
    {
      label: "Dashboard Overview",
      href: "#overview",
      icon: <Activity size={20} />,
    },
    {
      label: "Users",
      href: "#users",
      icon: <Users size={20} />,
      badge: users.filter((u) => !u.isActive).length,
    },
    {
      label: "Moderators",
      href: "#mods",
      icon: <UserCheck size={20} />,
      badge: mods.length,
    },
    {
      label: "Mod Requests",
      href: "#requests",
      icon: <FileText size={20} />,
      badge: modRequests.length,
    },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Admin Dashboard"
      subtitle="Manage users, moderators, and platform health"
      userRole={`${user?.role} • ${user?.name}`}
    >
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* Tabs for different sections */}
      <div className="mt-8">
        <Tabs
          defaultTab="users"
          tabs={[
            {
              id: "users",
              label: "Users",
              icon: <Users size={18} />,
              badge: users.length,
              content: (
                <div className="space-y-6">
                  <Toolbar
                    title="User Management"
                    description="Search and manage user accounts"
                  >
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    />
                  </Toolbar>

                  <SectionCard
                    title="All Users"
                    description={`Manage ${filteredUsers.length} users`}
                    icon={<Users size={20} />}
                  >
                    <DataTable
                      columns={userColumns}
                      data={filteredUsers}
                      isLoading={usersLoading}
                      searchable={false}
                      paginated
                      pageSize={10}
                      onView={setSelectedUser}
                      emptyMessage="No users found"
                    />
                  </SectionCard>
                </div>
              ),
            },
            {
              id: "mods",
              label: "Moderators",
              icon: <UserCheck size={18} />,
              badge: mods.length,
              content: (
                <div className="space-y-6">
                  <Toolbar
                    title="Moderator Management"
                    description="View and manage active moderators"
                  >
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={modSearch}
                      onChange={(e) => setModSearch(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    />
                  </Toolbar>

                  <SectionCard
                    title="Active Moderators"
                    description={`Managing ${filteredMods.length} moderators`}
                    icon={<UserCheck size={20} />}
                  >
                    <DataTable
                      columns={modColumns}
                      data={filteredMods}
                      isLoading={modsLoading}
                      searchable={false}
                      paginated
                      pageSize={10}
                      onView={setSelectedMod}
                      emptyMessage="No moderators found"
                    />
                  </SectionCard>
                </div>
              ),
            },
            {
              id: "requests",
              label: "Mod Requests",
              icon: <FileText size={18} />,
              badge: modRequests.length,
              content: (
                <div className="space-y-6">
                  <Toolbar
                    title="Moderator Requests"
                    description="Review and process moderator applications"
                  >
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    />
                  </Toolbar>

                  <SectionCard
                    title="Pending Requests"
                    description={`${filteredRequests.length} request${filteredRequests.length !== 1 ? "s" : ""} awaiting review`}
                    icon={<Clock size={20} />}
                  >
                    <DataTable
                      columns={requestColumns}
                      data={filteredRequests}
                      isLoading={requestsLoading}
                      searchable={false}
                      paginated
                      pageSize={10}
                      onView={setSelectedRequest}
                      emptyMessage="No pending requests"
                    />
                  </SectionCard>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Detail Panels */}
      {selectedUser && (
        <DetailPanel
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={selectedUser.name}
          subtitle={selectedUser.email}
          fields={[
            {
              label: "Email",
              value: selectedUser.email,
              icon: <Users size={16} />,
            },
            {
              label: "Role",
              value: selectedUser.role,
              badge: selectedUser.role,
            },
            {
              label: "Status",
              value: selectedUser.isActive ? "Active" : "Inactive",
              badge: selectedUser.isActive ? "Active" : "Inactive",
            },
            {
              label: "Contributions",
              value: selectedUser.contributions || 0,
            },
            {
              label: "Email Verified",
              value: selectedUser.isEmailVerified ? "Yes" : "No",
            },
            {
              label: "Member Since",
              value: new Date(selectedUser.createdAt).toLocaleDateString(),
            },
          ]}
          actions={[
            {
              label: selectedUser.isActive
                ? "Deactivate User"
                : "Activate User",
              onClick: () =>
                handleToggleUserStatus(selectedUser._id, selectedUser.isActive),
              variant: selectedUser.isActive ? "warning" : "primary",
              loading: Boolean(userPendingActions[selectedUser._id]),
            },
            {
              label: "Delete User",
              onClick: () => handleDeleteUser(selectedUser._id),
              variant: "danger",
              loading: Boolean(userPendingActions[selectedUser._id]),
            },
          ]}
        />
      )}

      {selectedMod && (
        <DetailPanel
          isOpen={true}
          onClose={() => setSelectedMod(null)}
          title={selectedMod.name}
          subtitle={`Moderator • ${selectedMod.email}`}
          fields={[
            {
              label: "Email",
              value: selectedMod.email,
              icon: <Users size={16} />,
            },
            {
              label: "Status",
              value: selectedMod.isActive ? "Active" : "Inactive",
              badge: selectedMod.isActive ? "Active" : "Inactive",
            },
            {
              label: "Contributions",
              value: selectedMod.contributions || 0,
              badge: selectedMod.contributions?.toString(),
            },
            {
              label: "Member Since",
              value: new Date(selectedMod.createdAt).toLocaleDateString(),
            },
          ]}
          actions={[
            {
              label: "Remove Moderator Role",
              onClick: () => handleRemoveModRole(selectedMod._id),
              variant: "danger",
              loading: Boolean(modPendingActions[selectedMod._id]),
            },
          ]}
        />
      )}

      {selectedRequest && (
        <DetailPanel
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={selectedRequest.name}
          subtitle={selectedRequest.email}
          fields={[
            {
              label: "Email",
              value: selectedRequest.email,
              icon: <Users size={16} />,
            },
            {
              label: "Motivation",
              value: selectedRequest.modMotivation || "Not provided",
            },
            {
              label: "Requested Date",
              value: new Date(
                selectedRequest.modRequestAt || "",
              ).toLocaleDateString(),
            },
            {
              label: "Contact Number",
              value: selectedRequest.contactNo || "Not provided",
            },
          ]}
          actions={[
            {
              label: "Approve Request",
              onClick: () =>
                handleProcessModRequest(selectedRequest._id, "approve"),
              variant: "primary",
              loading: Boolean(requestPendingActions[selectedRequest._id]),
            },
            {
              label: "Reject Request",
              onClick: () =>
                handleProcessModRequest(selectedRequest._id, "reject"),
              variant: "danger",
              loading: Boolean(requestPendingActions[selectedRequest._id]),
            },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
