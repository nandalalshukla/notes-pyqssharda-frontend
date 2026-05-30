"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import { useNotesStore } from "@/stores/notes/notes.store";
import { usePYQsStore } from "@/stores/pyqs/pyqs.store";
import { useSyllabusStore } from "@/stores/syllabus/syllabus.store";
import NotesForm from "@/components/forms/Notes";
import PyqsForm from "@/components/forms/pyqs";
import SyllabusForm from "@/components/forms/Syllabus";
import { DashboardLayout } from "@/components/dashboards/DashboardLayout";
import { StatCard, StatsGrid } from "@/components/dashboards/StatCard";
import { DataTable, DataTableColumn } from "@/components/dashboards/DataTable";
import DetailPanel from "@/components/dashboards/DetailPanel";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { Note } from "@/lib/api/notes/notes.api";
import { Pyq } from "@/lib/api/pyqs/pyqs.api";
import { Syllabus } from "@/lib/api/syllabus/syllabus.api";
import {
  BookOpen,
  FileText,
  ListChecks,
  Plus,
  Upload,
  Trash2,
  Eye,
  Edit,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";

type ContentItem = Note | Pyq | Syllabus;
type ContentType = "note" | "pyq" | "syllabus";

type ContentWithType = ContentItem & { type: ContentType };

export default function UserDashboard() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [activeModal, setActiveModal] = useState<ContentType | null>(null);
  const [editingItem, setEditingItem] = useState<ContentWithType | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentWithType | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [contentFilter, setContentFilter] = useState<ContentType | "all">(
    "all",
  );

  // Store state
  const {
    myNotes,
    fetchMyNotes,
    removeNote,
    isLoading: isNotesLoading,
  } = useNotesStore();

  const {
    myPyqs,
    fetchPYQs,
    removePYQ,
    isLoading: isPYQsLoading,
  } = usePYQsStore();

  const {
    mySyllabus,
    fetchSyllabus,
    removeSyllabus,
    isLoading: isSyllabusLoading,
  } = useSyllabusStore();

  // Data computation
  const allContent = useMemo(
    () => [
      ...myNotes.map((note) => ({ ...note, type: "note" as const })),
      ...myPyqs.map((pyq) => ({ ...pyq, type: "pyq" as const })),
      ...mySyllabus.map((syll) => ({ ...syll, type: "syllabus" as const })),
    ],
    [myNotes, myPyqs, mySyllabus],
  );

  // Filtered content
  const filteredContent = useMemo(
    () =>
      allContent.filter((item) => {
        const descValue =
          "description" in item && typeof item.description === "string"
            ? item.description
            : "";
        const matchesSearch =
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          descValue.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
          contentFilter === "all" || item.type === contentFilter;

        return matchesSearch && matchesFilter;
      }),
    [allContent, searchTerm, contentFilter],
  );

  // Stats
  const stats = [
    {
      label: "Total Contributions",
      value: allContent.length,
      icon: <TrendingUp size={24} />,
      variant: "primary" as const,
      description: "Content pieces shared",
    },
    {
      label: "Notes",
      value: myNotes.length,
      icon: <BookOpen size={24} />,
      variant: "success" as const,
      description: "Study notes",
    },
    {
      label: "PYQs",
      value: myPyqs.length,
      icon: <FileText size={24} />,
      variant: "warning" as const,
      description: "Previous year questions",
    },
    {
      label: "Syllabus",
      value: mySyllabus.length,
      icon: <ListChecks size={24} />,
      variant: "danger" as const,
      description: "Course syllabus",
    },
  ];

  // Effects
  useEffect(() => {
    fetchMyNotes();
    fetchPYQs();
    fetchSyllabus();
  }, []);

  useEffect(() => {
    const uploadType = searchParams.get("upload") as ContentType | null;
    if (uploadType && ["note", "pyq", "syllabus"].includes(uploadType)) {
      openModal(uploadType);
    }
  }, [searchParams]);

  // Handlers
  const handleDelete = async (type: ContentType, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      if (type === "note") await removeNote(id);
      else if (type === "pyq") await removePYQ(id);
      else if (type === "syllabus") await removeSyllabus(id);

      toast.success("Item deleted successfully");
      setSelectedItem(null);
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const openModal = (type: ContentType, item?: ContentWithType) => {
    setActiveModal(type);
    setEditingItem(item ? { ...item, type } : null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  const isLoading = isNotesLoading || isPYQsLoading || isSyllabusLoading;

  // Table columns
  const contentColumns: DataTableColumn<ContentWithType>[] = [
    {
      id: "title",
      header: "Content",
      accessor: (row) => {
        const desc =
          "description" in row && typeof row.description === "string"
            ? row.description
            : "No description";
        return (
          <div>
            <p className="font-medium text-slate-900 line-clamp-1">
              {row.title}
            </p>
            <p className="text-xs text-slate-500 line-clamp-1">{desc}</p>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessor: (row) => {
        const typeLabels = {
          note: "📝 Note",
          pyq: "❓ PYQ",
          syllabus: "📋 Syllabus",
        };
        return <span className="font-medium">{typeLabels[row.type]}</span>;
      },
    },
    {
      id: "createdAt",
      header: "Created",
      accessor: (row) => (
        <span className="text-sm text-slate-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === "approved"
              ? "bg-emerald-100 text-emerald-700"
              : row.status === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </span>
      ),
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
      label: "My Content",
      href: "#content",
      icon: <BookOpen size={20} />,
      badge: allContent.length,
    },
    {
      label: "Upload Content",
      href: "#upload",
      icon: <Upload size={20} />,
    },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="My Dashboard"
      subtitle="Manage and track your contributions"
      userRole={`${user?.role} • ${user?.name}`}
    >
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* Content Management Section */}
      <div className="mt-8 space-y-6">
        <Toolbar
          title="My Content Library"
          description="Upload, manage, and track your educational content"
          actions={
            <button
              onClick={() => openModal("note")}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm hover:shadow-md flex items-center gap-2"
            >
              <Plus size={18} />
              Add Content
            </button>
          }
        >
          {/* Search and Filter */}
          <div className="flex gap-3 w-full">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />
            <select
              value={contentFilter}
              onChange={(e) =>
                setContentFilter(e.target.value as ContentType | "all")
              }
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all font-medium"
            >
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="pyq">PYQs</option>
              <option value="syllabus">Syllabus</option>
            </select>
          </div>
        </Toolbar>

        <SectionCard
          title="Content Overview"
          description={`${filteredContent.length} item${
            filteredContent.length !== 1 ? "s" : ""
          } in your library`}
          icon={<BookOpen size={20} />}
          isLoading={isLoading}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <DataTable
              columns={contentColumns}
              data={filteredContent}
              searchable={false}
              paginated
              pageSize={10}
              onView={setSelectedItem}
              emptyMessage="No content yet. Start by uploading some notes, PYQs, or syllabus!"
            />
          )}
        </SectionCard>

        {/* Quick Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes Upload Card */}
          <div className="bg-white rounded-lg border-2 border-dashed border-emerald-200 p-6 hover:border-emerald-400 transition-colors cursor-pointer">
            <div onClick={() => openModal("note")} className="text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Share Notes</h3>
              <p className="text-sm text-slate-600">
                {myNotes.length} notes uploaded
              </p>
              <button className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                <Plus size={16} className="inline mr-2" />
                Add Notes
              </button>
            </div>
          </div>

          {/* PYQ Upload Card */}
          <div className="bg-white rounded-lg border-2 border-dashed border-orange-200 p-6 hover:border-orange-400 transition-colors cursor-pointer">
            <div onClick={() => openModal("pyq")} className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <FileText size={24} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Share PYQs</h3>
              <p className="text-sm text-slate-600">
                {myPyqs.length} PYQs uploaded
              </p>
              <button className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                <Plus size={16} className="inline mr-2" />
                Add PYQ
              </button>
            </div>
          </div>

          {/* Syllabus Upload Card */}
          <div className="bg-white rounded-lg border-2 border-dashed border-blue-200 p-6 hover:border-blue-400 transition-colors cursor-pointer">
            <div onClick={() => openModal("syllabus")} className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <ListChecks size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Share Syllabus
              </h3>
              <p className="text-sm text-slate-600">
                {mySyllabus.length} syllabus uploaded
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <Plus size={16} className="inline mr-2" />
                Add Syllabus
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <DetailPanel
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          subtitle={`${selectedItem.type.toUpperCase()} • ${new Date(selectedItem.createdAt).toLocaleDateString()}`}
          fields={[
            {
              label: "Type",
              value:
                selectedItem.type.charAt(0).toUpperCase() +
                selectedItem.type.slice(1),
              badge: selectedItem.type,
            },
            {
              label: "Description",
              value:
                ("description" in selectedItem &&
                typeof selectedItem.description === "string"
                  ? selectedItem.description
                  : null) || "No description",
            },
            {
              label: "Status",
              value:
                selectedItem.status?.charAt(0).toUpperCase() +
                selectedItem.status?.slice(1),
              badge: selectedItem.status,
            },
            {
              label: "Created",
              value: new Date(selectedItem.createdAt).toLocaleDateString(),
            },
            ...(selectedItem.type === "note"
              ? [
                  {
                    label: "Course",
                    value:
                      "courseName" in selectedItem && selectedItem.courseName
                        ? selectedItem.courseName
                        : "Not specified",
                  },
                ]
              : []),
          ]}
          actions={[
            {
              label: "Edit Content",
              onClick: () => openModal(selectedItem.type, selectedItem),
              variant: "primary",
            },
            {
              label: "Delete Content",
              onClick: () => handleDelete(selectedItem.type, selectedItem._id),
              variant: "danger",
            },
          ]}
        />
      )}

      {/* Modals */}
      {activeModal === "note" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <NotesForm
              onSuccess={() => {
                closeModal();
                fetchMyNotes();
              }}
              onClose={closeModal}
              initialData={
                editingItem && editingItem.type === "note"
                  ? (editingItem as Note)
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {activeModal === "pyq" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PyqsForm
              onSuccess={() => {
                closeModal();
                fetchPYQs();
              }}
              onClose={closeModal}
              initialData={
                editingItem && editingItem.type === "pyq"
                  ? (editingItem as Pyq)
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {activeModal === "syllabus" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SyllabusForm
              onSuccess={() => {
                closeModal();
                fetchSyllabus();
              }}
              onClose={closeModal}
              initialData={
                editingItem && editingItem.type === "syllabus"
                  ? (editingItem as Syllabus)
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
