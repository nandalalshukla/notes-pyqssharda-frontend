"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "@/stores/user/authStore";
import ModDashboard from "@/components/pages/ModDashboard";
import DashboardPage from "./DashboardPage";
import { useAdminUsersStore } from "@/stores/admin/users.store";
import { useAdminModsStore } from "@/stores/admin/mods.store";
import { useAdminModRequestsStore } from "@/stores/admin/modRequests.store";
import ModerationShell from "@/components/moderation/ModerationShell";
import ModerationToolbar from "@/components/moderation/ModerationToolbar";
import SearchInput from "@/components/moderation/SearchInput";
import FilterSelect from "@/components/moderation/FilterSelect";
import DataTable, { TableColumn } from "@/components/moderation/DataTable";
import StatusBadge from "@/components/moderation/StatusBadge";
import SectionCard from "@/components/moderation/SectionCard";
import StatsStrip from "@/components/moderation/StatsStrip";
import ActionMenu from "@/components/moderation/ActionMenu";
import Pagination from "@/components/moderation/Pagination";
import DetailPanel from "@/components/moderation/DetailPanel";
import Badge from "@/components/moderation/Badge";

type DashboardView = "admin" | "moderator" | "user";

import type { AdminUser } from "@/stores/admin/users.store";
import type { ModRequest } from "@/stores/admin/modRequests.store";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<DashboardView>("admin");
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [modFilter, setModFilter] = useState("all");
  const [requestPage, setRequestPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [modPage, setModPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ModRequest | null>(
    null,
  );
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

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return users.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized);
      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "active" && item.isActive) ||
        (userFilter === "inactive" && !item.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [users, search, userFilter]);

  const filteredMods = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return mods.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized);
      const matchesFilter =
        modFilter === "all" ||
        (modFilter === "active" && item.isActive) ||
        (modFilter === "inactive" && !item.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [mods, search, modFilter]);

  const filteredRequests = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return modRequests.filter((item) => {
      if (!normalized) return true;
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized)
      );
    });
  }, [modRequests, search]);

  const pageSize = 8;
  const pagedUsers = filteredUsers.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize,
  );
  const pagedMods = filteredMods.slice(
    (modPage - 1) * pageSize,
    modPage * pageSize,
  );
  const pagedRequests = filteredRequests.slice(
    (requestPage - 1) * pageSize,
    requestPage * pageSize,
  );

  useEffect(() => {
    if (currentView === "admin") {
      fetchUsers();
      fetchMods();
      fetchModRequests();
    }
  }, [currentView, fetchUsers, fetchMods, fetchModRequests]);

  // Show error toast if there's an error
  useEffect(() => {
    const error = usersError || modsError || requestsError;
    if (error) {
      toast.error(error);
    }
  }, [usersError, modsError, requestsError]);

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        if (!confirm("Are you sure you want to deactivate this user?")) return;
        await deactivateUser(id);
        toast.success("User deactivated successfully");
      } else {
        await activateUser(id);
        toast.success("User activated successfully");
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleModRequest = async (id: string, action: "approve" | "reject") => {
    try {
      await processModRequest(id, action);
      toast.success(`Request ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleRemoveMod = async (id: string) => {
    if (
      !confirm("Are you sure you want to remove moderator role from this user?")
    )
      return;
    try {
      await removeModRole(id);
      toast.success("Moderator role removed successfully");
    } catch (error) {
      toast.error("Failed to remove moderator role");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "⚠️ This will permanently delete the user and all their data. This action cannot be undone. Are you sure?",
      )
    )
      return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Render different views based on currentView
  if (currentView === "moderator") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          userName={user?.name}
        />
        <ModDashboard isViewedByAdmin={true} isEmbedded={true} />
      </div>
    );
  }

  if (currentView === "user") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          userName={user?.name}
        />
        <DashboardPage isEmbedded={true} />
      </div>
    );
  }

  // Admin view (default)
  const userColumns: TableColumn<AdminUser>[] = [
    {
      header: "User",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (row) => <Badge label={row.role} />,
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      accessor: (row) => {
        const pendingAction = userPendingActions[row._id];
        const isPending = Boolean(pendingAction);
        const toggleLabel = row.isActive ? "Deactivate" : "Activate";
        const pendingToggleLabel = row.isActive ? "Deactivating" : "Activating";

        return (
          <ActionMenu
            items={[
              {
                label:
                  pendingAction === "activate" || pendingAction === "deactivate"
                    ? pendingToggleLabel
                    : toggleLabel,
                loading:
                  pendingAction === "activate" ||
                  pendingAction === "deactivate",
                onClick: () => handleDeactivate(row._id, row.isActive),
                disabled: isPending,
              },
              {
                label: pendingAction === "delete" ? "Deleting" : "Delete",
                loading: pendingAction === "delete",
                onClick: () => handleDeleteUser(row._id),
                variant: "danger",
                disabled: isPending,
              },
            ]}
          />
        );
      },
      className: "text-right",
    },
  ];

  const modColumns: TableColumn<AdminUser>[] = [
    {
      header: "Moderator",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Contributions",
      accessor: (row) => (
        <span className="text-sm text-slate-700">{row.contributions || 0}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      accessor: (row) => {
        const pendingAction = modPendingActions[row._id];
        return (
          <ActionMenu
            items={[
              {
                label: pendingAction ? "Removing" : "Remove role",
                loading: Boolean(pendingAction),
                onClick: () => handleRemoveMod(row._id),
                variant: "danger",
                disabled: Boolean(pendingAction),
              },
            ]}
          />
        );
      },
      className: "text-right",
    },
  ];

  const requestColumns: TableColumn<ModRequest>[] = [
    {
      header: "Requester",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Motivation",
      accessor: (row) => (
        <p className="line-clamp-2 text-xs text-slate-600">
          {row.modMotivation || "—"}
        </p>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => {
        const pendingAction = requestPendingActions[row._id];
        const isPending = Boolean(pendingAction);

        return (
          <ActionMenu
            items={[
              {
                label: pendingAction === "approve" ? "Approving" : "Approve",
                loading: pendingAction === "approve",
                onClick: () => handleModRequest(row._id, "approve"),
                disabled: isPending,
              },
              {
                label: pendingAction === "reject" ? "Rejecting" : "Reject",
                loading: pendingAction === "reject",
                onClick: () => handleModRequest(row._id, "reject"),
                variant: "danger",
                disabled: isPending,
              },
            ]}
          />
        );
      },
      className: "text-right",
    },
  ];

  return (
    <ModerationShell
      title="Admin moderation"
      subtitle={`Welcome back, ${user?.name || "Admin"}. Keep users and moderators healthy.`}
      actions={
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          userName={user?.name}
        />
      }
    >
      <StatsStrip
        items={[
          { label: "Total users", value: users.length },
          { label: "Active moderators", value: mods.length },
          { label: "Pending requests", value: modRequests.length },
          {
            label: "Inactive users",
            value: users.filter((item) => !item.isActive).length,
          },
        ]}
      />

      <ModerationToolbar
        title="Directory"
        description="Search and filter user, moderator, and request queues in one place."
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email"
        />
        <FilterSelect
          label="Users"
          value={userFilter}
          onChange={(value) => {
            setUserFilter(value);
            setUserPage(1);
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
        <FilterSelect
          label="Moderators"
          value={modFilter}
          onChange={(value) => {
            setModFilter(value);
            setModPage(1);
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </ModerationToolbar>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Users"
          description="Review accounts and enforce status changes fast."
          actions={
            <Pagination
              page={userPage}
              totalPages={Math.max(
                1,
                Math.ceil(filteredUsers.length / pageSize),
              )}
              onPageChange={setUserPage}
            />
          }
        >
          <DataTable
            rows={pagedUsers}
            columns={userColumns}
            isLoading={usersLoading}
            emptyTitle="No users"
            emptyDescription="Try clearing filters or search."
            onRowClick={setSelectedUser}
          />
        </SectionCard>

        <SectionCard
          title="Moderators"
          description="Keep your trusted moderators active and focused."
          actions={
            <Pagination
              page={modPage}
              totalPages={Math.max(
                1,
                Math.ceil(filteredMods.length / pageSize),
              )}
              onPageChange={setModPage}
            />
          }
        >
          <DataTable
            rows={pagedMods}
            columns={modColumns}
            isLoading={modsLoading}
            emptyTitle="No moderators"
            emptyDescription="Approve a request to get started."
            onRowClick={setSelectedUser}
          />
        </SectionCard>

        <SectionCard
          title="Mod requests"
          description="Approve or reject moderator applications."
          actions={
            <Pagination
              page={requestPage}
              totalPages={Math.max(
                1,
                Math.ceil(filteredRequests.length / pageSize),
              )}
              onPageChange={setRequestPage}
            />
          }
        >
          <DataTable
            rows={pagedRequests}
            columns={requestColumns}
            isLoading={requestsLoading}
            emptyTitle="No requests"
            emptyDescription="All applications processed."
            onRowClick={setSelectedRequest}
          />
        </SectionCard>
      </div>

      <DetailPanel
        isOpen={Boolean(selectedUser)}
        title="User details"
        onClose={() => setSelectedUser(null)}
      >
        {selectedUser && (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Profile
              </p>
              <p className="text-base font-semibold text-slate-900">
                {selectedUser.name}
              </p>
              <p className="text-sm text-slate-500">{selectedUser.email}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge
                status={selectedUser.isActive ? "active" : "inactive"}
              />
              <Badge label={selectedUser.role} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Contributions</p>
              <p className="text-sm font-semibold text-slate-700">
                {selectedUser.contributions || 0}
              </p>
            </div>
          </div>
        )}
      </DetailPanel>

      <DetailPanel
        isOpen={Boolean(selectedRequest)}
        title="Request details"
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest && (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Applicant
              </p>
              <p className="text-base font-semibold text-slate-900">
                {selectedRequest.name}
              </p>
              <p className="text-sm text-slate-500">{selectedRequest.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Motivation</p>
              <p className="text-sm text-slate-700">
                {selectedRequest.modMotivation || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Contact</p>
              <p className="text-sm text-slate-700">
                {selectedRequest.contactNo || "—"}
              </p>
            </div>
          </div>
        )}
      </DetailPanel>
    </ModerationShell>
  );
}

// View Switcher Component
function ViewSwitcher({
  currentView,
  onViewChange,
  userName,
}: {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userName?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
        {userName || "Admin"}
      </span>
      <button
        onClick={() => onViewChange("admin")}
        className={`rounded-full px-3 py-1 ${
          currentView === "admin"
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        Admin
      </button>
      <button
        onClick={() => onViewChange("moderator")}
        className={`rounded-full px-3 py-1 ${
          currentView === "moderator"
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        Moderator
      </button>
      <button
        onClick={() => onViewChange("user")}
        className={`rounded-full px-3 py-1 ${
          currentView === "user"
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        User
      </button>
    </div>
  );
}
