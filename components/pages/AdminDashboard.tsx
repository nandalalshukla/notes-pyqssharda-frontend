"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/stores/admin.store";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const {
    users,
    mods,
    modRequests,
    isLoading,
    fetchUsers,
    fetchMods,
    fetchModRequests,
    processModRequest,
    deleteUser,
    deactivateUser,
    activateUser,
    removeModRole,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<"users" | "mods" | "requests">(
    "users"
  );

  useEffect(() => {
    fetchUsers();
    fetchMods();
    fetchModRequests();
  }, [fetchUsers, fetchMods, fetchModRequests]);

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      if (confirm("Deactivate this user?")) await deactivateUser(id);
    } else {
      await activateUser(id);
    }
  };

  const handleModRequest = async (id: string, action: "approve" | "reject") => {
    await processModRequest(id, action);
    toast.success(`Request ${action}ed`);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] p-8 font-sans">
      <div className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-black">
            Admin <span className="text-[#C084FC]">Dashboard</span>
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-gray-500 font-bold mb-2">Total Users</h3>
            <p className="text-4xl font-black">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-gray-500 font-bold mb-2">Active Moderators</h3>
            <p className="text-4xl font-black">{mods.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-gray-500 font-bold mb-2">
              Pending Mod Requests
            </h3>
            <p className="text-4xl font-black">{modRequests.length}</p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-bold transition-all ${
              activeTab === "users"
                ? "text-[#C084FC] border-b-2 border-[#C084FC]"
                : "text-gray-500"
            }`}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab("mods")}
            className={`px-4 py-2 font-bold transition-all ${
              activeTab === "mods"
                ? "text-[#C084FC] border-b-2 border-[#C084FC]"
                : "text-gray-500"
            }`}
          >
            Moderators
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-bold transition-all ${
              activeTab === "requests"
                ? "text-[#C084FC] border-b-2 border-[#C084FC]"
                : "text-gray-500"
            }`}
          >
            Mod Requests
            {modRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {modRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6">
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="p-4 font-black">Name</th>
                    <th className="p-4 font-black">Email</th>
                    <th className="p-4 font-black">Status</th>
                    <th className="p-4 font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() =>
                            handleDeactivate(user._id, user.isActive)
                          }
                          className="px-3 py-1 text-sm font-bold border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-yellow-100"
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete user?")) deleteUser(user._id);
                          }}
                          className="px-3 py-1 text-sm font-bold border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "mods" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="p-4 font-black">Name</th>
                    <th className="p-4 font-black">Email</th>
                    <th className="p-4 font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mods.map((mod) => (
                    <tr
                      key={mod._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">{mod.name}</td>
                      <td className="p-4 text-gray-600">{mod.email}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (confirm("Remove moderator role?"))
                              removeModRole(mod._id);
                          }} // Logic needs adding to store if missing
                          className="px-3 py-1 text-sm font-bold border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-orange-100"
                        >
                          Remove Mod Role
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mods.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        No moderators found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="grid gap-4">
              {/* Note: Adjust 'modRequests' mapping based on actual API response structure for 'modRequests' */}
              {/* The store currently types modRequests with a nested 'userId' object, verify backend controller return */}

              {modRequests.map((req: any) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl bg-gray-50"
                >
                  <div>
                    <h4 className="font-bold text-lg">
                      {req.name || req.userId?.name || "Unknown"}
                    </h4>
                    <p className="text-gray-500">
                      {req.email || req.userId?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModRequest(req._id, "approve")}
                      className="px-4 py-2 font-bold bg-green-100 border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-green-800"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModRequest(req._id, "reject")}
                      className="px-4 py-2 font-bold bg-red-100 border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-red-800"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {modRequests.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No pending requests
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
