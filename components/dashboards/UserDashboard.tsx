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
  Edit,
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
  const [activeNav, setActiveNav] = useState("overview");
  const [activeModal, setActiveModal] = useState<ContentType | null>(null);
  const [editingItem, setEditingItem] = useState<ContentWithType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentFilter, setContentFilter] = useState<ContentType | "all">("all");

  // Store state
  const { myNotes, fetchMyNotes, removeNote, isLoading: isNotesLoading } = useNotesStore();
  const { myPyqs, fetchPYQs, removePYQ, isLoading: isPYQsLoading } = usePYQsStore();
  const { mySyllabus, fetchSyllabus, removeSyllabus, isLoading: isSyllabusLoading } = useSyllabusStore();

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
          "description" in item && typeof item.description === "string" ? item.description : "";
        const matchesSearch =
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          descValue.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = contentFilter === "all" || item.type === contentFilter;
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
      description: "Content shared",
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
      description: "Question papers",
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
          "description" in row && typeof row.description === "string" ? row.description : "";
        return (
          <div>
            <p className="font-medium text-slate-900 line-clamp-1">{row.title}</p>
            {desc && <p className="text-xs text-slate-500 line-clamp-1">{desc}</p>}
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessor: (row) => {
        const typeLabels = { note: "📝 Note", pyq: "❓ PYQ", syllabus: "📋 Syllabus" };
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
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
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
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(row.type, row)}
            className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={() => handleDelete(row.type, row._id)}
            className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ),
    },
  ];

  // Navigation items
  const navItems = [
    {
      id: "overview",
      label: "Dashboard Overview",
      icon: <Activity size={20} />,
    },
    {
      id: "content",
      label: "My Content",
      icon: <BookOpen size={20} />,
      badge: allContent.length,
    },
    {
      id: "upload",
      label: "Upload Content",
      icon: <Upload size={20} />,
    },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      activeNavId={activeNav}
      onNavChange={setActiveNav}
      title="My Dashboard"
      subtitle="Manage and track your contributions"
      userRole={`${user?.role} • ${user?.name}`}
    >
      {/* Stats Grid - Always visible */}
      <StatsGrid stats={stats} columns={4} />

      {/* Overview Section */}
      {activeNav === "overview" && (
        <div className="mt-8 space-y-6">
          <SectionCard title="Quick Stats" description="Your contribution overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Approved Content</p>
                <p className="text-2xl font-bold">
                  {allContent.filter((c) => c.status === "approved").length}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold">
                  {allContent.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Rejection Rate</p>
                <p className="text-2xl font-bold">
                  {allContent.length > 0
                    ? Math.round(
                        (allContent.filter((c) => c.status === "rejected").length /
                          allContent.length) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Last Contribution</p>
                <p className="text-2xl font-bold">
                  {allContent.length > 0
                    ? new Date(allContent[0].createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Content Management Section */}
      {activeNav === "content" && (
        <div className="mt-8 space-y-6">
          <Toolbar
            title="My Content Library"
            description={`Manage ${filteredContent.length} ${contentFilter === "all" ? "items" : contentFilter + "s"}`}
          >
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as ContentType | "all")}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="note">Notes Only</option>
              <option value="pyq">PYQs Only</option>
              <option value="syllabus">Syllabus Only</option>
            </select>
          </Toolbar>

          <SectionCard
            title="Content Overview"
            description={`${filteredContent.length} item${filteredContent.length !== 1 ? "s" : ""}`}
            icon={<BookOpen size={20} />}
            isLoading={isLoading}
          >
            <DataTable
              columns={contentColumns}
              data={filteredContent}
              searchable={false}
              paginated
              pageSize={15}
              emptyMessage="No content yet. Upload your first note, PYQ, or syllabus!"
            />
          </SectionCard>
        </div>
      )}

      {/* Upload Section */}
      {activeNav === "upload" && (
        <div className="mt-8 space-y-6">
          <Toolbar
            title="Upload Content"
            description="Share educational resources with the community"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notes Upload Card */}
            <div className="bg-white rounded-lg border-2 border-dashed border-emerald-200 p-6 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group">
              <div onClick={() => openModal("note")} className="text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                  <BookOpen size={24} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Share Notes</h3>
                <p className="text-sm text-slate-600 mb-4">{myNotes.length} uploaded</p>
                <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium text-sm flex items-center gap-2 justify-center w-full">
                  <Plus size={16} />
                  Add Notes
                </button>
              </div>
            </div>

            {/* PYQ Upload Card */}
            <div className="bg-white rounded-lg border-2 border-dashed border-orange-200 p-6 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group">
              <div onClick={() => openModal("pyq")} className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                  <FileText size={24} className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Share PYQs</h3>
                <p className="text-sm text-slate-600 mb-4">{myPyqs.length} uploaded</p>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm flex items-center gap-2 justify-center w-full">
                  <Plus size={16} />
                  Add PYQ
                </button>
              </div>
            </div>

            {/* Syllabus Upload Card */}
            <div className="bg-white rounded-lg border-2 border-dashed border-blue-200 p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
              <div onClick={() => openModal("syllabus")} className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <ListChecks size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Share Syllabus</h3>
                <p className="text-sm text-slate-600 mb-4">{mySyllabus.length} uploaded</p>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm flex items-center gap-2 justify-center w-full">
                  <Plus size={16} />
                  Add Syllabus
                </button>
              </div>
            </div>
          </div>
        </div>
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
              initialData={editingItem && editingItem.type === "note" ? (editingItem as Note) : undefined}
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
              initialData={editingItem && editingItem.type === "pyq" ? (editingItem as Pyq) : undefined}
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
              initialData={editingItem && editingItem.type === "syllabus" ? (editingItem as Syllabus) : undefined}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

