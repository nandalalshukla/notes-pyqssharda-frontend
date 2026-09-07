"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import {
  Badge,
  Button,
  DataTable,
  Input,
  type BadgeVariant,
  type DataTableColumn,
} from "@/components/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  type AdminContentItem,
  type ContentStatusFilter,
  type ContentType,
} from "@/lib/api/admin/content.api";
import { actionKey, useAdminContentStore } from "@/stores/admin/content.store";
import { cn } from "@/lib/utils/cn";

const RejectionModal = dynamic(
  () => import("@/components/modals/RejectionModal"),
);
const ConfirmationDialog = dynamic(
  () => import("@/components/shared/ConfirmationDialog"),
);

/**
 * Content management for admins: every note, PYQ and syllabus, at any
 * status, with approve / decline / delete.
 *
 * One panel for all three types rather than three panels — they share a
 * schema and the same three actions, so the only thing that varies is
 * which endpoint the type parameter points at.
 *
 * Everything is server-side: the collection is far too large to load and
 * filter in the browser (PYQs alone is over five thousand rows), so the
 * status tabs, the search and the paging are all query parameters.
 */

const STATUS_TABS: { value: ContentStatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

const uploaderName = (row: AdminContentItem) =>
  typeof row.userId === "object" && row.userId
    ? (row.userId.username ?? row.userId.name ?? "Unknown")
    : "Unknown";

export default function ContentPanel() {
  const [type, setType] = useState<ContentType>("pyqs");
  const [status, setStatus] = useState<ContentStatusFilter>("pending");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  /**
   * The page, stored together with the filters it belongs to.
   *
   * Changing the type, status or search is a different result set, so the
   * page has to go back to 1 — otherwise switching to a tab with fewer
   * pages lands on an empty one. Deriving that (rather than resetting it
   * from an effect) means there's no render where the new filters are
   * paired with a stale page number.
   */
  const filterSignature = `${type}|${status}|${debouncedSearch}`;
  const [pageState, setPageState] = useState({
    signature: filterSignature,
    page: 1,
  });
  const page = pageState.signature === filterSignature ? pageState.page : 1;
  const setPage = (next: number) =>
    setPageState({ signature: filterSignature, page: next });

  const [rejecting, setRejecting] = useState<AdminContentItem | null>(null);
  const [deleting, setDeleting] = useState<AdminContentItem | null>(null);

  const state = useAdminContentStore((s) => s.byType[type]);
  const pendingActions = useAdminContentStore((s) => s.pendingActions);
  const fetchContent = useAdminContentStore((s) => s.fetchContent);
  const approve = useAdminContentStore((s) => s.approve);
  const reject = useAdminContentStore((s) => s.reject);
  const remove = useAdminContentStore((s) => s.remove);

  useEffect(() => {
    fetchContent(type, { status, page, query: debouncedSearch });
  }, [fetchContent, type, status, page, debouncedSearch]);

  const refresh = () =>
    fetchContent(type, { status, page, query: debouncedSearch });

  const handleApprove = async (row: AdminContentItem) => {
    try {
      await approve(type, row._id);
      toast.success(`${CONTENT_TYPE_LABELS[type]} approved and published`);
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejecting) return;
    try {
      await reject(type, rejecting._id, reason);
      toast.success("Declined — the uploader has been told why");
      setRejecting(null);
    } catch {
      toast.error("Failed to decline");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(type, deleting._id);
      toast.success("Deleted permanently");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const columns: DataTableColumn<AdminContentItem>[] = [
    {
      id: "title",
      header: "Resource",
      accessor: (row) => (
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium text-foreground">
            {row.courseName || row.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {[row.courseCode, row.program, `Sem ${row.semester}`, row.year]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "uploader",
      header: "Uploaded by",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {uploaderName(row)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <div>
          <Badge variant={STATUS_VARIANT[row.status] ?? "default"}>
            {row.status}
          </Badge>
          {row.status === "rejected" && row.rejectionReason && (
            <p
              className="mt-1 line-clamp-1 max-w-48 text-xs text-muted-foreground"
              title={row.rejectionReason}
            >
              {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Uploaded",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
      sortable: true,
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => {
        const busy = Boolean(pendingActions[actionKey(type, row._id)]);
        return (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Open the file to review it"
            >
              <ExternalLink size={13} />
              View
            </a>

            {/* Approve and decline only make sense on something not yet
                decided; delete applies at any status. */}
            {row.status !== "approved" && (
              <Button
                size="sm"
                variant="secondary"
                icon={<CheckCircle size={14} />}
                disabled={busy}
                onClick={() => handleApprove(row)}
              >
                Approve
              </Button>
            )}
            {row.status !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                icon={<XCircle size={14} />}
                disabled={busy}
                onClick={() => setRejecting(row)}
              >
                Decline
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              icon={<Trash2 size={14} />}
              disabled={busy}
              onClick={() => setDeleting(row)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <Toolbar
        title="Content Management"
        description="Approve, decline or remove any note, question paper or syllabus."
      >
        <Input
          type="text"
          placeholder="Search by subject, course name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>

      {/* Resource type */}
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn(
              "cursor-pointer rounded-xl border px-4 py-2 text-sm font-bold transition-colors",
              type === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {CONTENT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <SectionCard
        title={`${CONTENT_TYPE_LABELS[type]} library`}
        description={`${state.counts.all.toLocaleString()} total · ${state.counts.pending.toLocaleString()} awaiting review`}
        icon={<FileText size={20} />}
        onRefresh={refresh}
        isLoading={state.isLoading}
      >
        {/* Status, with live counts so an admin can see at a glance
            whether anything needs attention. */}
        <div className="mb-5 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              aria-pressed={status === tab.value}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
                status === tab.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">
                {state.counts[tab.value].toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {state.error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm font-semibold text-destructive">
            {state.error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={state.items}
          isLoading={state.isLoading}
          searchable={false}
          emptyTitle={
            status === "pending"
              ? "Nothing waiting for review"
              : `No ${status === "all" ? "" : status + " "}${CONTENT_TYPE_LABELS[type].toLowerCase()} found`
          }
        />

        {/* Server-side paging: the table only ever holds one page. */}
        {state.pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || state.isLoading}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold text-muted-foreground">
              Page {state.pagination.page} of{" "}
              {state.pagination.totalPages.toLocaleString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!state.pagination.hasMore || state.isLoading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </SectionCard>

      <RejectionModal
        isOpen={Boolean(rejecting)}
        itemTitle={rejecting?.courseName || rejecting?.title || ""}
        itemType={type === "pyqs" ? "pyq" : type === "notes" ? "note" : "syllabus"}
        onClose={() => setRejecting(null)}
        onSubmit={handleReject}
      />

      <ConfirmationDialog
        isOpen={Boolean(deleting)}
        title="Delete this resource?"
        message={`"${deleting?.courseName || deleting?.title}" will be removed permanently, along with its file. This cannot be undone.`}
        confirmText="Delete permanently"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
