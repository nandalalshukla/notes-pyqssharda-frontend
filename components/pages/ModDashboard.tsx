"use client";

import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import DashboardPage from "./DashboardPage";
import RejectionModal from "@/components/modals/RejectionModal";
import ModerationShell from "@/components/moderation/ModerationShell";
import ModerationToolbar from "@/components/moderation/ModerationToolbar";
import SearchInput from "@/components/moderation/SearchInput";
import FilterSelect from "@/components/moderation/FilterSelect";
import DataTable, { TableColumn } from "@/components/moderation/DataTable";
import SectionCard from "@/components/moderation/SectionCard";
import Pagination from "@/components/moderation/Pagination";
import StatusBadge from "@/components/moderation/StatusBadge";
import Badge from "@/components/moderation/Badge";
import ActionMenu from "@/components/moderation/ActionMenu";
import DetailPanel from "@/components/moderation/DetailPanel";
import StatsStrip from "@/components/moderation/StatsStrip";
import {
  getSubmissionActionKey,
  useModSubmissionsStore,
} from "@/stores/mod/submissions.store";
import { useModReportsStore } from "@/stores/mod/reports.store";
import type {
  PendingSubmission,
  SubmissionType,
} from "@/stores/mod/submissions.store";
import type {
  ReportListItem,
  ReportTargetType,
  ReportAction,
} from "@/lib/api/mod/mod.api";

type DashboardView = "moderator" | "user";

type SubmissionWithType = PendingSubmission & {
  submissionType: SubmissionType;
};

interface RejectionModalState {
  isOpen: boolean;
  itemId: string;
  itemType: SubmissionType;
  itemTitle: string;
}

export default function ModDashboard({
  isViewedByAdmin = false,
  isEmbedded = false,
}: {
  isViewedByAdmin?: boolean;
  isEmbedded?: boolean;
}) {
  type ModSubmissionsStore = ReturnType<typeof useModSubmissionsStore.getState>;
  type ModReportsStore = ReturnType<typeof useModReportsStore.getState>;

  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<DashboardView>("moderator");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<RejectionModalState>({
    isOpen: false,
    itemId: "",
    itemType: "note",
    itemTitle: "",
  });
  const [search, setSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [reportStatus, setReportStatus] = useState("pending");
  const [reportTargetType, setReportTargetType] = useState("all");
  const [submissionPage, setSubmissionPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithType | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(
    null,
  );

  const {
    submissionEntities,
    submissionIds,
    submissionLoading,
    submissionPendingActions,
    fetchAllPending,
    approveSubmission,
    rejectSubmission,
  } = useModSubmissionsStore(
    useShallow((state: ModSubmissionsStore) => ({
      submissionEntities: state.entities,
      submissionIds: state.ids,
      submissionLoading: state.isLoading,
      submissionPendingActions: state.pendingActions,
      fetchAllPending: state.fetchAllPending,
      approveSubmission: state.approveSubmission,
      rejectSubmission: state.rejectSubmission,
    })),
  );

  const {
    reportEntities,
    reportIds,
    reportsLoading,
    reportPendingActions,
    fetchReports,
    applyReportAction,
  } = useModReportsStore(
    useShallow((state: ModReportsStore) => ({
      reportEntities: state.entities,
      reportIds: state.ids,
      reportsLoading: state.isLoading,
      reportPendingActions: state.pendingActions,
      fetchReports: state.fetchReports,
      applyReportAction: state.applyReportAction,
    })),
  );

  const pendingNotes = useMemo(
    () =>
      submissionIds.note
        .map((id) => submissionEntities.note[id])
        .filter(Boolean),
    [submissionIds.note, submissionEntities.note],
  );
  const pendingPyqs = useMemo(
    () =>
      submissionIds.pyq.map((id) => submissionEntities.pyq[id]).filter(Boolean),
    [submissionIds.pyq, submissionEntities.pyq],
  );
  const pendingSyllabus = useMemo(
    () =>
      submissionIds.syllabus
        .map((id) => submissionEntities.syllabus[id])
        .filter(Boolean),
    [submissionIds.syllabus, submissionEntities.syllabus],
  );
  const pendingReports = useMemo(
    () => reportIds.map((id) => reportEntities[id]).filter(Boolean),
    [reportIds, reportEntities],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const typedSubmissions = useMemo(
    () => [
      ...pendingNotes.map((item) => ({
        ...item,
        submissionType: "note" as const,
      })),
      ...pendingPyqs.map((item) => ({
        ...item,
        submissionType: "pyq" as const,
      })),
      ...pendingSyllabus.map((item) => ({
        ...item,
        submissionType: "syllabus" as const,
      })),
    ],
    [pendingNotes, pendingPyqs, pendingSyllabus],
  );

  const filteredSubmissions = useMemo(() => {
    return typedSubmissions.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.userId?.name?.toLowerCase().includes(normalizedSearch) ||
        item.userId?.email?.toLowerCase().includes(normalizedSearch);
      const matchesType =
        submissionFilter === "all" || submissionFilter === item.submissionType;
      return matchesSearch && matchesType;
    });
  }, [typedSubmissions, normalizedSearch, submissionFilter]);

  const filteredReports = useMemo(() => {
    return pendingReports.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.reason.toLowerCase().includes(normalizedSearch) ||
        item.reporter?.username?.toLowerCase().includes(normalizedSearch) ||
        item.targetOwner?.username?.toLowerCase().includes(normalizedSearch) ||
        item.message?.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        reportStatus === "all" || item.status === reportStatus;
      const matchesTarget =
        reportTargetType === "all" || item.targetType === reportTargetType;
      return matchesSearch && matchesStatus && matchesTarget;
    });
  }, [pendingReports, normalizedSearch, reportStatus, reportTargetType]);

  const pageSize = 8;
  const pagedSubmissions = filteredSubmissions.slice(
    (submissionPage - 1) * pageSize,
    submissionPage * pageSize,
  );
  const pagedReports = filteredReports.slice(
    (reportPage - 1) * pageSize,
    reportPage * pageSize,
  );

  useEffect(() => {
    if (currentView === "moderator") {
      fetchAllPending();
      fetchReports({
        page: reportPage,
        limit: 20,
        status:
          reportStatus === "all"
            ? undefined
            : (reportStatus as ReportListItem["status"]),
        targetType:
          reportTargetType === "all"
            ? undefined
            : (reportTargetType as ReportTargetType),
      });
    }
  }, [
    currentView,
    fetchAllPending,
    fetchReports,
    reportPage,
    reportStatus,
    reportTargetType,
  ]);

  const handleSubmissionAction = async (
    id: string,
    type: SubmissionType,
    action: "approve" | "reject",
    title?: string,
  ) => {
    if (action === "reject") {
      setRejectionModal({
        isOpen: true,
        itemId: id,
        itemType: type,
        itemTitle: title || "Untitled",
      });
      return;
    }

    try {
      await approveSubmission(id, type);
      toast.success("Item approved successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to approve item";
      toast.error(errorMessage);
    }
  };

  const handleReportAction = async (id: string, action: ReportAction) => {
    try {
      await applyReportAction(id, action);
      toast.success("Report updated successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update report";
      toast.error(errorMessage);
    }
  };

  const handleRejectionSubmit = async (rejectionReason: string) => {
    setIsSubmitting(true);
    try {
      await rejectSubmission(
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject item";
      toast.error(errorMessage);
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
    pendingNotes.length +
    pendingPyqs.length +
    pendingSyllabus.length +
    pendingReports.length;

  if (currentView === "user") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
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

  const submissionColumns: TableColumn<SubmissionWithType>[] = [
    {
      header: "Submission",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500">
            {row.courseCode || "—"} · {row.courseName || "Course"}
          </p>
        </div>
      ),
    },
    {
      header: "Contributor",
      accessor: (row) => (
        <div>
          <p className="text-sm text-slate-700">
            {row.userId?.name || row.userId?.username || "Unknown"}
          </p>
          <p className="text-xs text-slate-500">{row.userId?.email || "—"}</p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge label={row.submissionType} />
          <Badge label={`Sem ${row.semester || "?"}`} />
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => {
        const actionKey = getSubmissionActionKey(row.submissionType, row._id);
        const pendingAction = submissionPendingActions[actionKey];
        const isPending = Boolean(pendingAction);

        return (
          <ActionMenu
            items={[
              {
                label: pendingAction === "approve" ? "Approving" : "Approve",
                loading: pendingAction === "approve",
                onClick: () =>
                  handleSubmissionAction(
                    row._id,
                    row.submissionType,
                    "approve",
                  ),
                disabled: isPending,
              },
              {
                label: pendingAction === "reject" ? "Rejecting" : "Reject",
                loading: pendingAction === "reject",
                onClick: () =>
                  handleSubmissionAction(
                    row._id,
                    row.submissionType,
                    "reject",
                    row.title,
                  ),
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

  const reportColumns: TableColumn<ReportListItem>[] = [
    {
      header: "Target",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900 capitalize">
            {row.targetType}
          </p>
          <p className="text-xs text-slate-500">{row.reason}</p>
        </div>
      ),
    },
    {
      header: "Reporter",
      accessor: (row) => (
        <p className="text-sm text-slate-700">
          {row.reporter?.username || "Unknown"}
        </p>
      ),
    },
    {
      header: "Owner",
      accessor: (row) => (
        <p className="text-sm text-slate-700">
          {row.targetOwner?.username || "Unknown"}
        </p>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <ActionMenu
          items={buildReportActions(
            row,
            handleReportAction,
            reportPendingActions[row._id],
          )}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <div
      className={
        isEmbedded
          ? "font-sans"
          : "min-h-screen bg-slate-50 p-4 md:p-8 font-sans"
      }
    >
      <ModerationShell
        title="Moderator workspace"
        subtitle={`Welcome back, ${user?.name || "Moderator"}. ${totalPending} items need review.`}
        actions={
          !isViewedByAdmin ? (
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              userName={user?.name}
            />
          ) : undefined
        }
      >
        <StatsStrip
          items={[
            { label: "Pending total", value: totalPending },
            { label: "Notes", value: pendingNotes.length },
            { label: "PYQs", value: pendingPyqs.length },
            { label: "Reports", value: pendingReports.length },
          ]}
        />

        <ModerationToolbar
          title="Moderation queue"
          description="Filter submissions and reports quickly."
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search titles, users, reasons"
          />
          <FilterSelect
            label="Submissions"
            value={submissionFilter}
            onChange={(value) => {
              setSubmissionFilter(value);
              setSubmissionPage(1);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Notes", value: "note" },
              { label: "PYQs", value: "pyq" },
              { label: "Syllabus", value: "syllabus" },
            ]}
          />
          <FilterSelect
            label="Report status"
            value={reportStatus}
            onChange={(value) => {
              setReportStatus(value);
              setReportPage(1);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Resolved", value: "resolved" },
              { label: "Rejected", value: "rejected" },
            ]}
          />
          <FilterSelect
            label="Target"
            value={reportTargetType}
            onChange={(value) => setReportTargetType(value)}
            options={[
              { label: "All", value: "all" },
              { label: "Post", value: "post" },
              { label: "Comment", value: "comment" },
              { label: "User", value: "user" },
            ]}
          />
        </ModerationToolbar>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Submissions"
            description="Approve or reject notes, PYQs, and syllabus uploads."
            actions={
              <Pagination
                page={submissionPage}
                totalPages={Math.max(
                  1,
                  Math.ceil(filteredSubmissions.length / pageSize),
                )}
                onPageChange={setSubmissionPage}
              />
            }
          >
            <DataTable
              rows={pagedSubmissions}
              columns={submissionColumns}
              isLoading={
                submissionLoading.note ||
                submissionLoading.pyq ||
                submissionLoading.syllabus
              }
              emptyTitle="No submissions"
              emptyDescription="Everything is already reviewed."
              onRowClick={setSelectedSubmission}
            />
          </SectionCard>

          <SectionCard
            title="Reports"
            description="Review reported posts, comments, and users."
            actions={
              <Pagination
                page={reportPage}
                totalPages={Math.max(
                  1,
                  Math.ceil(filteredReports.length / pageSize),
                )}
                onPageChange={setReportPage}
              />
            }
          >
            <DataTable
              rows={pagedReports}
              columns={reportColumns}
              isLoading={reportsLoading}
              emptyTitle="No reports"
              emptyDescription="Nothing is awaiting review."
              onRowClick={setSelectedReport}
            />
          </SectionCard>
        </div>

        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={handleRejectionModalClose}
          onSubmit={handleRejectionSubmit}
          itemType={rejectionModal.itemType}
          itemTitle={rejectionModal.itemTitle}
          isSubmitting={isSubmitting}
        />

        <DetailPanel
          isOpen={Boolean(selectedSubmission)}
          title="Submission details"
          onClose={() => setSelectedSubmission(null)}
        >
          {selectedSubmission && (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Title
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {selectedSubmission.title}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedSubmission.courseName}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label={selectedSubmission.program || "Program"} />
                <Badge
                  label={`Semester ${selectedSubmission.semester || "?"}`}
                />
                {selectedSubmission.year && (
                  <Badge label={`Year ${selectedSubmission.year}`} />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500">Contributor</p>
                <p className="text-sm text-slate-700">
                  {selectedSubmission.userId?.name ||
                    selectedSubmission.userId?.username ||
                    "Unknown"}
                </p>
              </div>
              {selectedSubmission.fileUrl && (
                <a
                  href={selectedSubmission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600"
                >
                  View attachment
                </a>
              )}
            </div>
          )}
        </DetailPanel>

        <DetailPanel
          isOpen={Boolean(selectedReport)}
          title="Report details"
          onClose={() => setSelectedReport(null)}
        >
          {selectedReport && (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Target
                </p>
                <p className="text-base font-semibold text-slate-900 capitalize">
                  {selectedReport.targetType}
                </p>
                <StatusBadge status={selectedReport.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Reason</p>
                <p className="text-sm text-slate-700">
                  {selectedReport.reason}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reporter</p>
                <p className="text-sm text-slate-700">
                  {selectedReport.reporter?.username || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Target owner</p>
                <p className="text-sm text-slate-700">
                  {selectedReport.targetOwner?.username || "Unknown"}
                </p>
              </div>
              {selectedReport.message && (
                <div>
                  <p className="text-xs text-slate-500">Message</p>
                  <p className="text-sm text-slate-700">
                    {selectedReport.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </DetailPanel>
      </ModerationShell>
    </div>
  );
}

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
        {userName || "Moderator"}
      </span>
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

function buildReportActions(
  report: ReportListItem,
  onAction: (reportId: string, action: ReportAction) => void,
  pendingAction?: ReportAction,
) {
  const baseActions = [
    {
      label: pendingAction === "resolve" ? "Resolving" : "Resolve",
      loading: pendingAction === "resolve",
      disabled: Boolean(pendingAction),
      onClick: () => onAction(report._id, "resolve"),
    },
    {
      label: pendingAction === "reject" ? "Rejecting" : "Reject",
      loading: pendingAction === "reject",
      disabled: Boolean(pendingAction),
      onClick: () => onAction(report._id, "reject"),
      variant: "danger" as const,
    },
  ];

  if (report.targetType === "post") {
    baseActions.push({
      label: pendingAction === "delete_post" ? "Deleting" : "Delete post",
      loading: pendingAction === "delete_post",
      disabled: Boolean(pendingAction),
      onClick: () => onAction(report._id, "delete_post"),
      variant: "danger" as const,
    });
  }

  if (report.targetType === "comment") {
    baseActions.push({
      label: pendingAction === "delete_comment" ? "Deleting" : "Delete comment",
      loading: pendingAction === "delete_comment",
      disabled: Boolean(pendingAction),
      onClick: () => onAction(report._id, "delete_comment"),
      variant: "danger" as const,
    });
  }

  if (report.targetType === "user") {
    baseActions.push({
      label: pendingAction === "suspend_user" ? "Suspending" : "Suspend user",
      loading: pendingAction === "suspend_user",
      disabled: Boolean(pendingAction),
      onClick: () => onAction(report._id, "suspend_user"),
      variant: "danger" as const,
    });
    baseActions.push({
      label: pendingAction === "warn_user" ? "Warning" : "Warn user",
      loading: pendingAction === "warn_user",
      disabled: Boolean(pendingAction),
      onClick: () => onAction(report._id, "warn_user"),
    });
  }

  return report.status === "pending" ? baseActions : baseActions.slice(0, 1);
}
