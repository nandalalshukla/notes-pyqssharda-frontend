"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/stores/admin/admin.store";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import ModDashboard from "./ModDashboard";
import DashboardPage from "./DashboardPage";
import { FaUserShield, FaUserTie, FaUser } from "react-icons/fa";

type DashboardView = "admin" | "moderator" | "user";

// Import types from admin store
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  contributions: number;
  createdAt: string;
  contactNo?: string;
  modRequest?: "pending" | "approved" | "rejected";
  modMotivation?: string;
  modRequestAt?: string;
}

interface ModRequest {
  _id: string;
  name: string;
  email: string;
  contactNo: string;
  modMotivation: string;
  modRequestAt: string;
  role: string;
  isActive: boolean;
  contributions: number;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<DashboardView>("admin");
  const {
    users,
    mods,
    modRequests,
    isLoading,
    error,
    fetchUsers,
    fetchMods,
    fetchModRequests,
    processModRequest,
    deleteUser,
    deactivateUser,
    activateUser,
    removeModRole,
  } = useAdminStore();

  useEffect(() => {
    if (currentView === "admin") {
      fetchUsers();
      fetchMods();
      fetchModRequests();
    }
  }, [currentView, fetchUsers, fetchMods, fetchModRequests]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleModRequest = async (id: string, action: "approve" | "reject") => {
    try {
      await processModRequest(id, action);
      toast.success(`Request ${action}ed successfully`);
      fetchModRequests(); // Refresh mod requests
      if (action === "approve") {
        fetchMods(); // Refresh mods list if approved
      }
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
      fetchMods(); // Refresh the mods list
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
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Render different views based on currentView
  if (currentView === "moderator") {
    return (
      <div className="min-h-screen bg-[#F2F4F8] p-4 md:p-8 font-sans">
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
      <div className="min-h-screen bg-[#F2F4F8] p-4 md:p-8 font-sans">
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
  return (
    <div className="min-h-screen bg-[#F2F4F8] p-4 md:p-8 font-sans">
      {/* View Switcher */}
      <ViewSwitcher
        currentView={currentView}
        onViewChange={setCurrentView}
        userName={user?.name}
      />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 animate-fade-in-up">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">
            Admin <span className="text-[#C084FC]">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Welcome back, {user?.name || "Admin"}. Manage users and moderators
            efficiently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
            <StatCard
              label="Total Users"
              value={users.length}
              color="bg-blue-300"
            />
            <StatCard
              label="Active Moderators"
              value={mods.length}
              color="bg-orange-300"
            />
            <StatCard
              label="Pending Mod Requests"
              value={modRequests.length}
              color="bg-green-300"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Users Section */}
          <AdminSection title="All Users" color="#93C5FD">
            {users.length === 0 ? (
              <EmptyState message="No users found." />
            ) : (
              users.map((u) => (
                <UserCard
                  key={u._id}
                  user={u}
                  onDeactivate={() => handleDeactivate(u._id, u.isActive)}
                  onDelete={() => handleDeleteUser(u._id)}
                />
              ))
            )}
          </AdminSection>

          {/* Moderators Section */}
          <AdminSection title="Moderators" color="#FDBA74">
            {mods.length === 0 ? (
              <EmptyState message="No moderators found." />
            ) : (
              mods.map((mod) => (
                <ModCard
                  key={mod._id}
                  mod={mod}
                  onRemove={() => handleRemoveMod(mod._id)}
                />
              ))
            )}
          </AdminSection>

          {/* Mod Requests Section */}
          <AdminSection title="Mod Requests" color="#86EFAC">
            {modRequests.length === 0 ? (
              <EmptyState message="No pending requests." />
            ) : (
              modRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  req={req}
                  onApprove={() => handleModRequest(req._id, "approve")}
                  onReject={() => handleModRequest(req._id, "reject")}
                />
              ))
            )}
          </AdminSection>
        </div>
      )}
    </div>
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
    <div className="max-w-7xl mx-auto mb-8">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-black flex items-center gap-2">
              <FaUserTie className="w-5 h-5" />
              Admin Controls - {userName || "Admin"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Switch between different role views
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center md:justify-end">
            <button
              onClick={() => onViewChange("admin")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
                currentView === "admin"
                  ? "bg-purple-400 text-white"
                  : "bg-purple-100 text-black"
              }`}
            >
              <FaUserTie className="w-4 h-4" />
              Admin View
            </button>
            <button
              onClick={() => onViewChange("moderator")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
                currentView === "moderator"
                  ? "bg-orange-400 text-white"
                  : "bg-orange-100 text-black"
              }`}
            >
              <FaUserShield className="w-4 h-4" />
              Moderator View
            </button>
            <button
              onClick={() => onViewChange("user")}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
                currentView === "user"
                  ? "bg-blue-400 text-white"
                  : "bg-blue-100 text-black"
              }`}
            >
              <FaUser className="w-4 h-4" />
              User View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`${color} border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 transition-transform hover:-translate-y-1`}
    >
      <div className="text-3xl md:text-4xl font-black text-black mb-1">
        {value}
      </div>
      <div className="text-xs md:text-sm font-bold text-black/80 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function AdminSection({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-black text-black flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border-2 border-black"
            style={{ backgroundColor: color }}
          ></span>
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px] md:max-h-[600px] p-4 md:p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center text-gray-400 py-12 italic border-2 border-dashed border-gray-300 rounded-xl">
      {message}
    </div>
  );
}

function UserCard({
  user,
  onDeactivate,
  onDelete,
}: {
  user: User;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base md:text-lg text-black truncate">
            {user.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <span
          className={`ml-2 px-2 py-1 rounded-md text-[10px] uppercase font-black border border-black whitespace-nowrap ${
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="text-xs text-gray-600 mb-3 space-y-1">
        <div className="flex justify-between">
          <span>Role:</span>
          <span className="font-bold">{user.role}</span>
        </div>
        <div className="flex justify-between">
          <span>Contributions:</span>
          <span className="font-bold">{user.contributions || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Email Verified:</span>
          <span className="font-bold">
            {user.isEmailVerified ? "✓ Yes" : "✗ No"}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={onDeactivate}
          className="flex-1 px-2 py-1.5 text-xs font-bold bg-yellow-100 hover:bg-yellow-200 border border-black rounded-lg transition-colors text-yellow-800"
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs font-bold bg-red-100 hover:bg-red-200 border border-black rounded-lg transition-colors text-red-800"
          title="Delete User"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function ModCard({ mod, onRemove }: { mod: User; onRemove: () => void }) {
  return (
    <div className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
      <div className="mb-3">
        <h3 className="font-bold text-base md:text-lg text-black truncate">
          {mod.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">{mod.email}</p>
      </div>

      <div className="text-xs text-gray-600 mb-3 space-y-1">
        <div className="flex justify-between">
          <span>Contributions:</span>
          <span className="font-bold">{mod.contributions || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-bold">
            {mod.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="w-full px-3 py-2 text-xs font-bold bg-orange-100 hover:bg-orange-200 border border-black rounded-lg transition-colors text-orange-800"
      >
        Remove Mod Role
      </button>
    </div>
  );
}

function RequestCard({
  req,
  onApprove,
  onReject,
}: {
  req: ModRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
      <div className="mb-3">
        <h3 className="font-bold text-base md:text-lg text-black truncate">
          {req.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">{req.email}</p>
        <p className="text-xs font-medium text-purple-600 mt-1">
          📝 Moderator Request
        </p>
      </div>

      {req.contactNo && (
        <div className="text-xs text-gray-600 mb-2">
          <span className="font-bold">Contact:</span> {req.contactNo}
        </div>
      )}

      {req.modMotivation && (
        <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded border border-gray-200">
          <span className="font-bold block mb-1">Motivation:</span>
          <p className="line-clamp-3">{req.modMotivation}</p>
        </div>
      )}

      {req.modRequestAt && (
        <div className="text-xs text-gray-500 mb-3">
          Requested: {new Date(req.modRequestAt).toLocaleDateString()}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 py-2 bg-green-100 hover:bg-green-200 border border-black rounded-lg transition-colors text-green-700 font-bold text-xs"
        >
          ✓ Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-2 bg-red-100 hover:bg-red-200 border border-black rounded-lg transition-colors text-red-700 font-bold text-xs"
        >
          ✗ Reject
        </button>
      </div>
    </div>
  );
}
