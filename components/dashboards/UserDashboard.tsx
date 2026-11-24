"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { StatsGrid } from "@/components/dashboards/StatCard";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { DataTable, DataTableColumn, Badge, Button, Input, Select } from "@/components/ui";
import { Note } from "@/lib/api/notes/notes.api";
import { Pyq } from "@/lib/api/pyqs/pyqs.api";
import { Syllabus } from "@/lib/api/syllabus/syllabus.api";
import { getMineResources } from "@/lib/api/user/resources.api";
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
  Search,
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
  const [contentStatus, setContentStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [contentPage, setContentPage] = useState(1);
  const [contentSort, setContentSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });
  const [mineItems, setMineItems] = useState<ContentWithType[]>([]);
  const [minePagination, setMinePagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null>(null);
  const [mineCounts, setMineCounts] = useState<{
    pending: number;
    approved: number;
    rejected: number;
    all: number;
  } | null>(null);
  const [countsByType, setCountsByType] = useState<Record<ContentType, {
    pending: number; approved: number; rejected: number; all: number;
  }> | null>(null);

  // Store state
  const {
    myNotes,
    myNotesPagination,
    myNotesCounts,
    fetchMyNotes,
    removeNote,
    isLoading: isNotesLoading,
  } = useNotesStore();
  const {
    myPyqs,
    myPyqsPagination,
    myPyqsCounts,
    fetchPYQs,
    removePYQ,
    isLoading: isPYQsLoading,
  } = usePYQsStore();
  const {
    mySyllabus,
    mySyllabusPagination,
    mySyllabusCounts,
    fetchSyllabus,
    removeSyllabus,
    isLoading: isSyllabusLoading,
  } = useSyllabusStore();

  // Data computation
  const filteredContent = useMemo(() => {
    if (contentFilter === "note") {
      return myNotes.map((note) => ({ ...note, type: "note" as const }));
    }
    if (contentFilter === "pyq") {
      return myPyqs.map((pyq) => ({ ...pyq, type: "pyq" as const }));
    }
    if (contentFilter === "syllabus") {
      return mySyllabus.map((syll) => ({ ...syll, type: "syllabus" as const }));
    }
    return mineItems;
  }, [contentFilter, mineItems, myNotes, myPyqs, mySyllabus]);

  const totalContributions = mineCounts?.all ??
    (myNotesCounts?.all ?? 0) +
    (myPyqsCounts?.all ?? 0) +
    (mySyllabusCounts?.all ?? 0);
  const notesTotal = countsByType?.note.all ?? myNotesCounts?.all ?? 0;
  const pyqsTotal = countsByType?.pyq.all ?? myPyqsCounts?.all ?? 0;
  const syllabusTotal = countsByType?.syllabus.all ?? mySyllabusCounts?.all ?? 0;

  // Stats
  const stats = [
    {
      label: "Total Contributions",
      value: totalContributions,
      icon: <TrendingUp size={24} />,
      variant: "primary" as const,
      description: "Content shared",
    },
    {
      label: "Notes",
      value: notesTotal,
      icon: <BookOpen size={24} />,
      variant: "success" as const,
      description: "Study notes",
    },
    {
      label: "PYQs",
      value: pyqsTotal,
      icon: <FileText size={24} />,
      variant: "warning" as const,
      description: "Question papers",
    },
    {
      label: "Syllabus",
      value: syllabusTotal,
      icon: <ListChecks size={24} />,
      variant: "danger" as const,
      description: "Course syllabus",
    },
  ];

  const loadCurrentResources = useCallback(async () => {
    const params = {
      page: contentPage,
      limit: 25,
      query: searchTerm.trim() || undefined,
      status: contentStatus === "all" ? undefined : contentStatus,
      sort: contentSort.key as "createdAt" | "updatedAt" | "title" | "courseCode",
      direction: contentSort.direction,
    };

    if (contentFilter === "all") {
      try {
        const res = await getMineResources({ ...params, status: contentStatus });
        setMineItems(
          (res.items || []).map((item: ContentItem & { resourceType: ContentType }) => ({
            ...item,
            type: item.resourceType,
          })),
        );
        setMinePagination(res.pagination || null);
        setMineCounts(res.counts || null);
        setCountsByType(res.countsByType || null);
      } catch {
        setMineItems([]);
        setMinePagination(null);
        setMineCounts(null);
        setCountsByType(null);
      }
    } else if (contentFilter === "note") {
      await fetchMyNotes(params);
    } else if (contentFilter === "pyq") {
      await fetchPYQs(params);
    } else {
      await fetchSyllabus(params);
    }
  }, [contentFilter, contentPage, contentSort, contentStatus, fetchMyNotes, fetchPYQs, fetchSyllabus, searchTerm]);

  // Effects
  useEffect(() => {
    const timeout = window.setTimeout(() => void loadCurrentResources(), 250);
    return () => window.clearTimeout(timeout);
  }, [loadCurrentResources]);

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
      await loadCurrentResources();
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
            <p className="line-clamp-1 font-medium text-foreground">{row.title}</p>
            {desc && <p className="line-clamp-1 text-xs text-muted-foreground">{desc}</p>}
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
        return <span className="font-medium text-foreground">{typeLabels[row.type]}</span>;
      },
    },
    {
      id: "createdAt",
      header: "Created",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge
          variant={
            row.status === "approved" ? "success" : row.status === "pending" ? "warning" : "destructive"
          }
        >
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={<Edit size={14} />} onClick={() => openModal(row.type, row)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" icon={<Trash2 size={14} />} onClick={() => handleDelete(row.type, row._id)}>
            Delete
          </Button>
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
      badge: totalContributions,
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Approved Content</p>
                <p className="text-2xl font-bold text-foreground">
                  {(countsByType?.note.approved ?? myNotesCounts?.approved ?? 0) +
                    (countsByType?.pyq.approved ?? myPyqsCounts?.approved ?? 0) +
                    (countsByType?.syllabus.approved ?? mySyllabusCounts?.approved ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground">
                  {(countsByType?.note.pending ?? myNotesCounts?.pending ?? 0) +
                    (countsByType?.pyq.pending ?? myPyqsCounts?.pending ?? 0) +
                    (countsByType?.syllabus.pending ?? mySyllabusCounts?.pending ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Rejection Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalContributions > 0
                    ? Math.round(
                        (((countsByType?.note.rejected ?? myNotesCounts?.rejected ?? 0) +
                          (countsByType?.pyq.rejected ?? myPyqsCounts?.rejected ?? 0) +
                          (countsByType?.syllabus.rejected ?? mySyllabusCounts?.rejected ?? 0)) /
                          totalContributions) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Last Contribution</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalContributions > 0
                    ? mineItems[0]
                      ? new Date(mineItems[0].createdAt).toLocaleDateString()
                      : "—"
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
            description={`Manage ${contentFilter === "all" ? minePagination?.total ?? 0 : contentFilter === "note" ? myNotesPagination?.total ?? 0 : contentFilter === "pyq" ? myPyqsPagination?.total ?? 0 : mySyllabusPagination?.total ?? 0} ${contentFilter === "all" ? "items" : contentFilter + "s"}`}
          >
            <Input
              icon={<Search size={16} />}
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => {
                setContentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="flex-1"
            />
            <Select
              value={contentFilter}
              onChange={(e) => {
                setContentPage(1);
                setContentFilter(e.target.value as ContentType | "all");
              }}
              className="w-auto"
            >
              <option value="all">All Types</option>
              <option value="note">Notes Only</option>
              <option value="pyq">PYQs Only</option>
              <option value="syllabus">Syllabus Only</option>
            </Select>
            <Select
              value={contentStatus}
              onChange={(e) => {
                setContentPage(1);
                setContentStatus(e.target.value as typeof contentStatus);
              }}
              className="w-auto"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Toolbar>

          <SectionCard
            title="Content Overview"
            description={`${contentFilter === "all" ? minePagination?.total ?? 0 : contentFilter === "note" ? myNotesPagination?.total ?? 0 : contentFilter === "pyq" ? myPyqsPagination?.total ?? 0 : mySyllabusPagination?.total ?? 0} matching items`}
            icon={<BookOpen size={20} />}
            isLoading={isLoading}
          >
            <DataTable
              columns={contentColumns}
              data={filteredContent}
              searchable={false}
              paginated
              pageSize={15}
              serverPagination={
                contentFilter === "note"
                  ? myNotesPagination ?? undefined
                  : contentFilter === "pyq"
                    ? myPyqsPagination ?? undefined
                    : contentFilter === "syllabus"
                      ? mySyllabusPagination ?? undefined
                      : minePagination ?? undefined
              }
              onServerPageChange={setContentPage}
              serverSort={contentSort}
              onServerSortChange={(next) => {
                setContentPage(1);
                setContentSort(next ?? { key: "createdAt", direction: "desc" });
              }}
              emptyTitle="No content yet. Upload your first note, PYQ, or syllabus!"
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Notes Upload Card */}
            <div className="group cursor-pointer rounded-xl border-2 border-dashed border-accent-mint/40 bg-card p-6 transition-all hover:border-accent-mint hover:shadow-soft-md">
              <div onClick={() => openModal("note")} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-mint/20 transition-colors group-hover:bg-accent-mint/30">
                  <BookOpen size={24} className="text-accent-mint-foreground dark:text-accent-mint" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">Share Notes</h3>
                <p className="mb-4 text-sm text-muted-foreground">{notesTotal} uploaded</p>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-mint/20 px-4 py-2 text-sm font-medium text-accent-mint-foreground transition-colors hover:bg-accent-mint/30 dark:text-accent-mint cursor-pointer">
                  <Plus size={16} />
                  Add Notes
                </button>
              </div>
            </div>

            {/* PYQ Upload Card */}
            <div className="group cursor-pointer rounded-xl border-2 border-dashed border-accent-coral/40 bg-card p-6 transition-all hover:border-accent-coral hover:shadow-soft-md">
              <div onClick={() => openModal("pyq")} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-coral/20 transition-colors group-hover:bg-accent-coral/30">
                  <FileText size={24} className="text-accent-coral-foreground dark:text-accent-coral" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">Share PYQs</h3>
                <p className="mb-4 text-sm text-muted-foreground">{pyqsTotal} uploaded</p>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-coral/20 px-4 py-2 text-sm font-medium text-accent-coral-foreground transition-colors hover:bg-accent-coral/30 dark:text-accent-coral cursor-pointer">
                  <Plus size={16} />
                  Add PYQ
                </button>
              </div>
            </div>

            {/* Syllabus Upload Card */}
            <div className="group cursor-pointer rounded-xl border-2 border-dashed border-accent-purple/40 bg-card p-6 transition-all hover:border-accent-purple hover:shadow-soft-md">
              <div onClick={() => openModal("syllabus")} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple/20 transition-colors group-hover:bg-accent-purple/30">
                  <ListChecks size={24} className="text-accent-purple-foreground dark:text-accent-purple" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">Share Syllabus</h3>
                <p className="mb-4 text-sm text-muted-foreground">{syllabusTotal} uploaded</p>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-purple/20 px-4 py-2 text-sm font-medium text-accent-purple-foreground transition-colors hover:bg-accent-purple/30 dark:text-accent-purple cursor-pointer">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <NotesForm
              onSuccess={async () => {
                closeModal();
                await loadCurrentResources();
              }}
              onClose={closeModal}
              initialData={editingItem && editingItem.type === "note" ? (editingItem as Note) : undefined}
            />
          </div>
        </div>
      )}

      {activeModal === "pyq" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PyqsForm
              onSuccess={async () => {
                closeModal();
                await loadCurrentResources();
              }}
              onClose={closeModal}
              initialData={editingItem && editingItem.type === "pyq" ? (editingItem as Pyq) : undefined}
            />
          </div>
        </div>
      )}

      {activeModal === "syllabus" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SyllabusForm
              onSuccess={async () => {
                closeModal();
                await loadCurrentResources();
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
