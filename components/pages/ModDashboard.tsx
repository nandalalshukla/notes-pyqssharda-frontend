"use client";

import { useEffect, useState } from "react";
import { useModStore } from "@/stores/mod.store";
import { toast } from "react-hot-toast";

export default function ModDashboard() {
  const {
    pendingNotes,
    pendingPyqs,
    pendingSyllabus,
    isLoading,
    fetchPendingContent,
    approveItem,
    rejectItem,
  } = useModStore();

  const [activeTab, setActiveTab] = useState<"notes" | "pyqs" | "syllabus">(
    "notes"
  );

  useEffect(() => {
    fetchPendingContent();
  }, [fetchPendingContent]);

  const handleAction = async (
    id: string,
    type: "note" | "pyq" | "syllabus",
    action: "approve" | "reject"
  ) => {
    if (action === "approve") {
      await approveItem(id, type);
      toast.success("Item approved successfully");
    } else {
      await rejectItem(id, type);
      toast.success("Item rejected");
    }
  };

  const renderContentList = (
    items: any[],
    type: "note" | "pyq" | "syllabus"
  ) => {
    if (items.length === 0) {
      return (
        <div className="p-12 text-center text-gray-500 font-medium text-lg">
          No pending {type}s to review. Good job! 🎉
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-black transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black mb-1 group-hover:text-[#C084FC] transition-colors">
                  {item.title}
                </h3>
                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span>{item.courseName || item.program}</span>
                  <span>•</span>
                  <span>Uploaded by: {item.userId?.name || "Unknown"}</span>
                </div>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm font-bold hover:text-blue-800"
                >
                  View File
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(item._id, type, "approve")}
                  className="px-4 py-2 bg-green-100 text-green-800 font-bold rounded-lg border-2 border-transparent hover:border-green-600 transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(item._id, type, "reject")}
                  className="px-4 py-2 bg-red-100 text-red-800 font-bold rounded-lg border-2 border-transparent hover:border-red-600 transition-all"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] p-8 font-sans">
      <div className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-black">
            Moderator <span className="text-[#C084FC]">Dashboard</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            label="Pending Notes"
            count={pendingNotes.length}
            color="bg-[#A7F3D0]"
          />
          <StatsCard
            label="Pending PYQs"
            count={pendingPyqs.length}
            color="bg-[#FDE68A]"
          />
          <StatsCard
            label="Pending Syllabus"
            count={pendingSyllabus.length}
            color="bg-[#BFDBFE]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          {["notes", "pyqs", "syllabus"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-black text-lg capitalize transition-all relative top-[2px] ${
                activeTab === tab
                  ? "text-black border-2 border-black border-b-white bg-white rounded-t-xl z-10"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab} (
              {tab === "notes"
                ? pendingNotes.length
                : tab === "pyqs"
                ? pendingPyqs.length
                : pendingSyllabus.length}
              )
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 rounded-tl-none">
          {activeTab === "notes" && renderContentList(pendingNotes, "note")}
          {activeTab === "pyqs" && renderContentList(pendingPyqs, "pyq")}
          {activeTab === "syllabus" &&
            renderContentList(pendingSyllabus, "syllabus")}
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) => (
  <div
    className={`p-6 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}
  >
    <h3 className="text-black font-bold mb-1 opacity-70">{label}</h3>
    <p className="text-4xl font-black text-black">{count}</p>
  </div>
);
