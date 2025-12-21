"use client";

import React, { useEffect, useState } from "react";
import NotesForm from "@/components/forms/Notes";
import PyqsForm from "@/components/forms/pyqs";
import SyllabusForm from "@/components/forms/Syllabus";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/authStore";
import { useNotesStore } from "@/stores/notes.store";
import { usePYQsStore } from "@/stores/pyqs.store";
import { useSyllabusStore } from "@/stores/syllabus.store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    notes,
    fetchNotes,
    removeNote,
    isLoading: isNotesLoading,
  } = useNotesStore();
  const {
    pyqs,
    fetchPYQs,
    removePYQ,
    isLoading: isPYQsLoading,
  } = usePYQsStore();
  const {
    syllabusList: syllabus,
    fetchSyllabus,
    removeSyllabus,
    isLoading: isSyllabusLoading,
  } = useSyllabusStore();

  const [activeModal, setActiveModal] = useState<
    "note" | "pyq" | "syllabus" | null
  >(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    await Promise.all([fetchNotes(), fetchPYQs(), fetchSyllabus()]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isLoading = isNotesLoading || isPYQsLoading || isSyllabusLoading;

  const handleDelete = async (
    type: "note" | "pyq" | "syllabus",
    id: string
  ) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      if (type === "note") await removeNote(id);
      if (type === "pyq") await removePYQ(id);
      if (type === "syllabus") await removeSyllabus(id);
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const openModal = (type: "note" | "pyq" | "syllabus", item?: any) => {
    setActiveModal(type);
    setEditingItem(item || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  const totalContributions = notes.length + pyqs.length + syllabus.length;

  return (
    <div className="min-h-screen bg-[#F2F4F8] p-8 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 animate-fade-in-up">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-black text-black mb-2">
            Welcome back,{" "}
            <span className="text-[#C084FC]">{user?.name || "Scholar"}</span>!
            👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here&apos;s an overview of your contributions to the library.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <StatCard
              label="Total Contributions"
              value={totalContributions}
              color="bg-blue-100"
            />
            <StatCard
              label="PYQs Uploaded"
              value={pyqs.length}
              color="bg-[#FF9F66]"
            />
            <StatCard
              label="Notes Shared"
              value={notes.length}
              color="bg-[#4ADE80]"
            />
            <StatCard
              label="Syllabus Added"
              value={syllabus.length}
              color="bg-[#C084FC]"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PYQs Section */}
          <Section
            title="PYQs"
            items={pyqs}
            onAdd={() => openModal("pyq")}
            onEdit={(item) => openModal("pyq", item)}
            onDelete={(id) => handleDelete("pyq", id)}
            type="pyq"
            color="#FF9F66"
          />

          {/* Notes Section */}
          <Section
            title="Notes"
            items={notes}
            onAdd={() => openModal("note")}
            onEdit={(item) => openModal("note", item)}
            onDelete={(id) => handleDelete("note", id)}
            type="note"
            color="#4ADE80"
          />

          {/* Syllabus Section */}
          <Section
            title="Syllabus"
            items={syllabus}
            onAdd={() => openModal("syllabus")}
            onEdit={(item) => openModal("syllabus", item)}
            onDelete={(id) => handleDelete("syllabus", id)}
            type="syllabus"
            color="#C084FC"
          />
        </div>
      )}

      {/* Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === "pyq" && (
              <PyqsForm
                onClose={closeModal}
                initialData={editingItem}
                onSuccess={fetchData}
              />
            )}
            {activeModal === "note" && (
              <NotesForm
                onClose={closeModal}
                initialData={editingItem}
                onSuccess={fetchData}
              />
            )}
            {activeModal === "syllabus" && (
              <SyllabusForm
                onClose={closeModal}
                initialData={editingItem}
                onSuccess={fetchData}
              />
            )}
          </div>
        </div>
      )}
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
      <div className="text-3xl font-black text-black mb-1">{value}</div>
      <div className="text-sm font-bold text-black/80 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
  type,
  color,
}: {
  title: string;
  items: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  type: "note" | "pyq" | "syllabus";
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border-2 border-black"
            style={{ backgroundColor: color }}
          ></span>
          {title}
        </h2>
        <button
          onClick={onAdd}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-sm"
        >
          + Add New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4 custom-scrollbar bg-[#F2F4F8]/50">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-12 italic border-2 border-dashed border-gray-300 rounded-xl">
            No {title} uploaded yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="group bg-white p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="font-bold text-lg text-black line-clamp-1"
                  title={item.title}
                >
                  {item.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-black"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-black"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="inline-block px-2 py-1 bg-gray-100 border border-black rounded-md text-xs font-bold mr-2">
                  {item.courseCode}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {item.courseName}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-xs font-bold text-gray-500">
                  {item.program} • Sem {item.semester}{" "}
                  {type === "pyq" && `• ${item.year}`}
                </div>
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black underline decoration-2 hover:text-purple-600 transition-colors"
                >
                  VIEW FILE →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
