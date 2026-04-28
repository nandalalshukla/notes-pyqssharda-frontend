"use client";

import { useEffect, useState } from "react";
import { useModStore } from "@/stores/mod/mod.store";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import DashboardPage from "./DashboardPage";
import RejectionModal from "@/components/modals/RejectionModal";
import { FaUserShield, FaUser } from "react-icons/fa";

type DashboardView = "moderator" | "user";

interface RejectionModalState {
  isOpen: boolean;
  itemId: string;
  itemType: "note" | "pyq" | "syllabus";
  itemTitle: string;
}

export default function ModDashboard({
  isViewedByAdmin = false,
  isEmbedded = false,
}: {
  isViewedByAdmin?: boolean;
  isEmbedded?: boolean;
}) {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<DashboardView>("moderator");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<RejectionModalState>({
    isOpen: false,
    itemId: "",
    itemType: "note",
    itemTitle: "",
  });

  const {
    pendingNotes,
    pendingPyqs,
    pendingSyllabus,
    isLoading,
    fetchPendingContent,
    approveItem,
    rejectItem,
  } = useModStore();

  useEffect(() => {
    if (currentView === "moderator") {
      fetchPendingContent();
    }
  }, [currentView, fetchPendingContent]);

  const handleAction = async (
    id: string,
    type: "note" | "pyq" | "syllabus",
    action: "approve" | "reject",
    title?: string,
  ) => {
    if (action === "reject") {
      // Open rejection modal
      setRejectionModal({
        isOpen: true,
        itemId: id,
        itemType: type,
        itemTitle: title || "Untitled",
      });
    } else {
      // Handle approval directly
      try {
        await approveItem(id, type);
        toast.success("Item approved successfully");
        // No need to refetch - store already updates optimistically
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to approve item";
        toast.error(errorMessage);
        console.error("Approval error:", error);
        // Only refetch on error to restore correct state
        await fetchPendingContent();
      }
    }
  };

  const handleRejectionSubmit = async (rejectionReason: string) => {
    setIsSubmitting(true);
    try {
      await rejectItem(
        rejectionModal.itemId,
        rejectionModal.itemType,
        rejectionReason,
      );
      toast.success("Item rejected successfully");
      setRejectionModal({
        isOpen: false,
        itemId: "",
        itemType: "note",
        itemTitle: "",
      });
      // No need to refetch - store already updates optimistically
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject item";
      toast.error(errorMessage);
      console.error("Rejection error:", error);
      // Only refetch on error to restore correct state
      await fetchPendingContent();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectionModalClose = () => {
    if (!isSubmitting) {
      setRejectionModal({
        isOpen: false,
        itemId: "",
        itemType: "note",
        itemTitle: "",
      });
    }
  };

  const totalPending =
    pendingNotes.length + pendingPyqs.length + pendingSyllabus.length;

  // Render User View
  if (currentView === "user") {
    return (
      <div className="min-h-screen bg-[#F2F4F8] p-4 md:p-8 font-sans">
        {!isViewedByAdmin && (
          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
            userName={user?.name}
          />
        )}
        <DashboardPage isEmbedded={true} />
      </div>
    );
  }

  // Render Moderator View (default)
  return (
    <div
      className={
        isEmbedded
          ? "font-sans"
          : "min-h-screen bg-[#F2F4F8] p-4 md:p-8 font-sans"
      }
    >
      {/* View Switcher */}
      {!isViewedByAdmin && (
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          userName={user?.name}
        />
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 animate-fade-in-up">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">
            Moderator <span className="text-[#C084FC]">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Welcome back, {user?.name || "Moderator"}. You have {totalPending}{" "}
            pending {totalPending === 1 ? "item" : "items"} to review.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
            <StatCard
              label="Total Pending"
              value={totalPending}
              color="bg-blue-300"
            />
            <StatCard
              label="Pending PYQs"
              value={pendingPyqs.length}
              color="bg-orange-300"
            />
            <StatCard
              label="Pending Notes"
              value={pendingNotes.length}
              color="bg-green-300"
            />
            <StatCard
              label="Pending Syllabus"
              value={pendingSyllabus.length}
              color="bg-purple-300"
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
          {/* PYQs Section */}
          <ModSection
            title="Pending PYQs"
            items={pendingPyqs}
            onApprove={(id) => handleAction(id, "pyq", "approve")}
            onReject={(id, title) => handleAction(id, "pyq", "reject", title)}
            type="pyq"
            color="#FDBA74"
          />

          {/* Notes Section */}
          <ModSection
            title="Pending Notes"
            items={pendingNotes}
            onApprove={(id) => handleAction(id, "note", "approve")}
            onReject={(id, title) => handleAction(id, "note", "reject", title)}
            type="note"
            color="#86EFAC"
          />

          {/* Syllabus Section */}
          <ModSection
            title="Pending Syllabus"
            items={pendingSyllabus}
            onApprove={(id) => handleAction(id, "syllabus", "approve")}
            onReject={(id, title) =>
              handleAction(id, "syllabus", "reject", title)
            }
            type="syllabus"
            color="#C084FC"
          />
        </div>
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={handleRejectionModalClose}
        onSubmit={handleRejectionSubmit}
        itemType={rejectionModal.itemType}
        itemTitle={rejectionModal.itemTitle}
        isSubmitting={isSubmitting}
      />
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
              <FaUserShield className="w-5 h-5" />
              Moderator Controls - {userName || "Moderator"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Switch between moderator and user views
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center md:justify-end">
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

function ModSection({
  title,
  items,
  onApprove,
  onReject,
  type,
  color,
}: {
  title: string;
  items: any[];
  onApprove: (id: string) => void;
  onReject: (id: string, title: string) => void;
  type: "note" | "pyq" | "syllabus";
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
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-12 italic border-2 border-dashed border-gray-300 rounded-xl">
            No {title.toLowerCase()} to review. Good job! 🎉
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="font-bold text-base md:text-lg text-black line-clamp-2"
                  title={item.title}
                >
                  {item.title}
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.courseCode && (
                    <div className="inline-block px-2 py-1 bg-gray-100 border border-black rounded-md text-xs font-bold text-black">
                      {item.courseCode}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-600 line-clamp-1">
                    {item.courseName || "No Course Name"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  By:{" "}
                  <span className="font-semibold text-black">
                    {item.userId?.name || item.userId?.username || "Unknown"}
                  </span>
                </div>
                {item.userId?.email && (
                  <div className="text-xs text-gray-500">
                    Email:{" "}
                    <span className="font-medium text-black">
                      {item.userId.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[150px]">
                  <div className="text-xs font-bold text-gray-500 mb-2">
                    {item.program || "Program n/a"} • Sem {item.semester || "?"}{" "}
                    {type === "pyq" && item.year && `• ${item.year}`}
                  </div>
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black underline decoration-2 hover:text-purple-600 transition-colors text-black"
                    >
                      VIEW FILE →
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(item._id)}
                    className="p-2 bg-green-100 hover:bg-green-200 border border-black rounded-lg transition-colors text-green-700 font-bold text-sm"
                    title="Approve"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => onReject(item._id, item.title)}
                    className="p-2 bg-red-100 hover:bg-red-200 border border-black rounded-lg transition-colors text-red-700 font-bold text-sm"
                    title="Reject"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
