"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import RejectionModal from "@/components/modals/RejectionModal";
import { ReportActionModal } from "@/components/modals/ReportActionModal";
import ViewPostModal from "@/components/modals/ViewPostModal";
import ViewCommentModal from "@/components/modals/ViewCommentModal";
import { DashboardLayout } from "@/components/dashboards/DashboardLayout";
import { StatCard, StatsGrid } from "@/components/dashboards/StatCard";
import { DataTable, DataTableColumn } from "@/components/dashboards/DataTable";
import DetailPanel from "@/components/dashboards/DetailPanel";
import {
  SectionCard,
  Tabs,
  Toolbar,
} from "@/components/dashboards/SectionCard";
import { UserProfileLink } from "@/components/shared/UserProfileLink";
import {
  getSubmissionActionKey,
  useModSubmissionsStore,
} from "@/stores/mod/submissions.store";
import { useModReportsStore } from "@/stores/mod/reports.store";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Trash2,
  Ban,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type {
  PendingSubmission,
  SubmissionType,
} from "@/stores/mod/submissions.store";
import type {
  ReportListItem,
  ReportTargetType,
  ReportAction,
} from "@/lib/api/mod/mod.api";

interface RejectionModalState {
  isOpen: boolean;
  itemId: string;
  itemType: SubmissionType;
  itemTitle: string;
}

interface ReportActionModalState {
  isOpen: boolean;
  action: ReportAction | null;
  reportId: string | null;
  isLoading: boolean;
}

interface SubmissionWithType extends PendingSubmission {
  submissionType: SubmissionType;
}

export default function ModeratorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rejectionModal, setRejectionModal] = useState<RejectionModalState>({
    isOpen: false,
    itemId: "",
    itemType: "note",
    itemTitle: "",
  });
  const [actionModal, setActionModal] = useState<ReportActionModalState>({
    isOpen: false,
    action: null,
    reportId: null,
    isLoading: false,
  });
  const [viewPostModal, setViewPostModal] = useState({
    isOpen: false,
    postId: "",
  });
  const [viewCommentModal, setViewCommentModal] = useState({
    isOpen: false,
    postId: "",
    commentId: "",
  });
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithType | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(
    null,
  );

  // Store state
  const {
    submissionEntities,
    submissionIds,
    submissionLoading,
    submissionPendingActions,
    fetchAllPending,
    approveSubmission,
    rejectSubmission,
  } = useModSubmissionsStore(
    useShallow((state) => ({
      submissionEntities: state.entities,
      submissionIds: state.ids,
      submissionLoading: Object.values(state.isLoading).some(
        (loading) => loading,
      ),
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
    reportsError,
    reportPendingActions,
    fetchReports,
    applyReportAction,
  } = useModReportsStore(
    useShallow((state) => ({
      reportEntities: state.entities,
      reportIds: state.ids,
      reportsLoading: state.isLoading,
      reportsError: state.error,
      reportPendingActions: state.pendingActions,
      fetchReports: state.fetchReports,
      applyReportAction: state.applyReportAction,
    })),
  );

  // Data computation
  const submissions = useMemo(() => {
    const allSubmissions: SubmissionWithType[] = [];

    (["note", "pyq", "syllabus"] as const).forEach((type) => {
      const typeIds = submissionIds[type] || [];
      const typeEntities = submissionEntities[type] || {};

      typeIds.forEach((id) => {
        const entity = typeEntities[id];
        if (entity) {
          allSubmissions.push({
            ...entity,
            submissionType: type,
          });
        }
      });
    });

    return allSubmissions;
  }, [submissionIds, submissionEntities]);

  const reports = useMemo(
    () => reportIds.map((id) => reportEntities[id]).filter(Boolean),
    [reportIds, reportEntities],
  );

  // Filtered data
  const filteredSubmissions = useMemo(
    () =>
      submissions.filter(
        (s) =>
          s.title?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
          s.submissionType.includes(submissionSearch.toLowerCase()),
      ),
    [submissions, submissionSearch],
  );

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.reason?.toLowerCase().includes(reportSearch.toLowerCase()) ||
          r.targetEntity?.content
            ?.toLowerCase()
            .includes(reportSearch.toLowerCase()) ||
          r.targetType?.includes(reportSearch.toLowerCase()),
      ),
    [reports, reportSearch],
  );

  // Stats
  const stats = [
    {
      label: "Pending Submissions",
      value: submissions.length,
      icon: <Clock size={24} />,
      variant: "warning" as const,
      description: "Awaiting review",
    },
    {
      label: "Pending Reports",
      value: reports.filter((r) => r.status === "pending").length,
      icon: <AlertCircle size={24} />,
      variant: "danger" as const,
      description: "Require action",
    },
    {
      label: "Approved Today",
      value: submissions.filter(
        (s) =>
          s.createdAt &&
          new Date(s.createdAt).toDateString() === new Date().toDateString(),
      ).length,
      icon: <CheckCircle size={24} />,
      variant: "success" as const,
      description: "Reviewed content",
    },
    {
      label: "Resolution Rate",
      value:
        reports.length > 0
          ? Math.round(
              (reports.filter((r) => r.status !== "pending").length /
                reports.length) *
                100,
            ) + "%"
          : "0%",
      icon: <TrendingUp size={24} />,
      variant: "primary" as const,
      description: "Reports resolved",
    },
  ];

  // Effects
  useEffect(() => {
    fetchAllPending();
    fetchReports();
  }, []);

  useEffect(() => {
    if (reportsError) {
      toast.error(reportsError);
    }
  }, [reportsError]);

  // Handlers
  const handleApproveSubmission = async (id: string, type: SubmissionType) => {
    try {
      await approveSubmission(id, type);
      toast.success("Submission approved");
      setSelectedSubmission(null);
    } catch (error) {
      toast.error("Failed to approve submission");
    }
  };

  const handleRejectSubmission = (
    id: string,
    title: string,
    type: SubmissionType,
  ) => {
    setRejectionModal({
      isOpen: true,
      itemId: id,
      itemType: type,
      itemTitle: title,
    });
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      await rejectSubmission(
        rejectionModal.itemId,
        rejectionModal.itemType,
        reason,
      );
      toast.success("Submission rejected");
      setSelectedSubmission(null);
      setRejectionModal({ ...rejectionModal, isOpen: false });
    } catch (error) {
      toast.error("Failed to reject submission");
    }
  };

  const handleReportAction = (action: ReportAction) => {
    if (!selectedReport) return;
    setActionModal({
      isOpen: true,
      action,
      reportId: selectedReport._id,
      isLoading: false,
    });
  };

  const handleConfirmReportAction = async () => {
    if (!actionModal.reportId || !actionModal.action) return;

    setActionModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await applyReportAction(actionModal.reportId, actionModal.action);
      toast.success(`Report action completed: ${actionModal.action}`);
      setActionModal({
        isOpen: false,
        action: null,
        reportId: null,
        isLoading: false,
      });
      setSelectedReport(null);
    } catch (error) {
      toast.error("Failed to apply report action");
    } finally {
      setActionModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Table columns
  const submissionColumns: DataTableColumn<SubmissionWithType>[] = [
    {
      id: "title",
      header: "Content",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-900 line-clamp-1">{row.title}</p>
          <p className="text-xs text-slate-500 capitalize">
            {row.submissionType}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "createdAt",
      header: "Submitted",
      accessor: (row) => (
        <span className="text-sm text-slate-600">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessor: (row) => (
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
          {row.submissionType}
        </span>
      ),
    },
  ];

  const reportColumns: DataTableColumn<ReportListItem>[] = [
    {
      id: "target",
      header: "Report Target",
      accessor: (row) => {
        const handleTargetClick = (e: React.MouseEvent) => {
          e.stopPropagation();

          if (row.targetType === "user") {
            // Navigate to user profile
            router.push(`/profile/${row.targetOwner?._id}`);
          } else if (row.targetType === "post") {
            // Open post modal
            setViewPostModal({
              isOpen: true,
              postId: row.targetId,
            });
          } else if (row.targetType === "comment") {
            // Open comment modal
            setViewCommentModal({
              isOpen: true,
              postId: row.targetEntity?.post || "",
              commentId: row.targetId,
            });
          }
        };

        return (
          <div className="cursor-pointer" onClick={handleTargetClick}>
            <div className="font-medium text-blue-600 hover:text-blue-700 hover:underline line-clamp-1">
              {row.targetType === "user"
                ? row.targetEntity?.username || "Unknown User"
                : row.targetEntity?.content || "Unknown"}
            </div>
            <p className="text-xs text-slate-500 capitalize">
              {row.targetType}
            </p>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "reporter",
      header: "Reported By",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.reporter ? (
            <UserProfileLink
              userId={row.reporter._id}
              username={row.reporter.username || "Unknown"}
              profilePic={row.reporter.profilePic}
              showAvatar={true}
              linkClassName="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm"
            />
          ) : (
            <span className="text-sm text-slate-500">Unknown Reporter</span>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      id: "reason",
      header: "Reason",
      accessor: (row) => (
        <span className="text-sm text-slate-600 line-clamp-2">
          {row.reason}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : row.status === "resolved" || row.status === "reviewed"
                ? "bg-emerald-100 text-emerald-700"
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
      label: "Pending Submissions",
      href: "#submissions",
      icon: <FileText size={20} />,
      badge: submissions.length,
    },
    {
      label: "Reports",
      href: "#reports",
      icon: <AlertCircle size={20} />,
      badge: reports.filter((r) => r.status === "pending").length,
    },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      title="Moderator Dashboard"
      subtitle="Review submissions and manage user reports"
      userRole={`${user?.role} • ${user?.name}`}
    >
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* Tabs for different sections */}
      <div className="mt-8">
        <Tabs
          defaultTab="submissions"
          tabs={[
            {
              id: "submissions",
              label: "Submissions",
              icon: <FileText size={18} />,
              badge: submissions.length,
              content: (
                <div className="space-y-6">
                  <Toolbar
                    title="Pending Submissions"
                    description="Review and approve user-submitted content"
                  >
                    <input
                      type="text"
                      placeholder="Search by title or type..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    />
                  </Toolbar>

                  <SectionCard
                    title="Content Queue"
                    description={`${filteredSubmissions.length} submission${
                      filteredSubmissions.length !== 1 ? "s" : ""
                    } awaiting review`}
                    icon={<Clock size={20} />}
                  >
                    <DataTable
                      columns={submissionColumns}
                      data={filteredSubmissions}
                      isLoading={submissionLoading}
                      searchable={false}
                      paginated
                      pageSize={10}
                      onView={setSelectedSubmission}
                      emptyMessage="No pending submissions"
                    />
                  </SectionCard>
                </div>
              ),
            },
            {
              id: "reports",
              label: "Reports",
              icon: <AlertCircle size={18} />,
              badge: reports.filter((r) => r.status === "pending").length,
              content: (
                <div className="space-y-6">
                  <Toolbar
                    title="User Reports"
                    description="Review and take action on reported content"
                  >
                    <input
                      type="text"
                      placeholder="Search by target or reason..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    />
                  </Toolbar>

                  <SectionCard
                    title="Report Queue"
                    description={`${filteredReports.length} report${
                      filteredReports.length !== 1 ? "s" : ""
                    } to process`}
                    icon={<AlertCircle size={20} />}
                  >
                    <DataTable
                      columns={reportColumns}
                      data={filteredReports}
                      isLoading={reportsLoading}
                      searchable={false}
                      paginated
                      pageSize={10}
                      onView={setSelectedReport}
                      emptyMessage="No reports found"
                    />
                  </SectionCard>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Detail Panels */}
      {selectedSubmission && (
        <DetailPanel
          isOpen={true}
          onClose={() => setSelectedSubmission(null)}
          title={selectedSubmission.title}
          subtitle={`${selectedSubmission.submissionType.charAt(0).toUpperCase() + selectedSubmission.submissionType.slice(1)} • ${selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleDateString() : "Unknown Date"}`}
          fields={[
            {
              label: "Type",
              value: selectedSubmission.submissionType.toUpperCase(),
              badge: selectedSubmission.submissionType,
            },
            {
              label: "Submitted On",
              value: selectedSubmission.createdAt
                ? new Date(selectedSubmission.createdAt).toLocaleDateString()
                : "Unknown",
            },
            {
              label: "Description",
              value: selectedSubmission.description || "No description",
            },
          ]}
          actions={[
            {
              label: "Approve Submission",
              onClick: () =>
                handleApproveSubmission(
                  selectedSubmission._id,
                  selectedSubmission.submissionType,
                ),
              variant: "primary",
              loading: Boolean(
                submissionPendingActions[
                  getSubmissionActionKey(
                    selectedSubmission.submissionType,
                    selectedSubmission._id,
                  )
                ],
              ),
            },
            {
              label: "Reject Submission",
              onClick: () =>
                handleRejectSubmission(
                  selectedSubmission._id,
                  selectedSubmission.title,
                  selectedSubmission.submissionType,
                ),
              variant: "danger",
              loading: Boolean(
                submissionPendingActions[
                  getSubmissionActionKey(
                    selectedSubmission.submissionType,
                    selectedSubmission._id,
                  )
                ],
              ),
            },
          ]}
        />
      )}

      {selectedReport && (
        <DetailPanel
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={
            selectedReport.targetType === "user"
              ? selectedReport.targetEntity?.username || "Unknown User"
              : selectedReport.targetEntity?.post ||
                selectedReport.targetEntity?.content ||
                "Unknown"
          }
          subtitle={`Report • ${selectedReport.targetType} • ${selectedReport.status}`}
          fields={[
            {
              label: "Target Type",
              value: selectedReport.targetType,
              badge: selectedReport.targetType,
              icon:
                selectedReport.targetType === "post" ? (
                  <FileText className="w-5 h-5" />
                ) : selectedReport.targetType === "comment" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Ban className="w-5 h-5" />
                ),
            },
            {
              label: "Reason",
              value: selectedReport.reason?.replace(/_/g, " "),
              icon: <AlertTriangle className="w-5 h-5" />,
            },
            {
              label: "Report Message",
              value: selectedReport.message || "No additional message",
            },
            {
              label: "Status",
              value: selectedReport.status?.toUpperCase(),
              badge: selectedReport.status,
            },
            {
              label: "Reported On",
              value: selectedReport.createdAt
                ? new Date(selectedReport.createdAt).toLocaleDateString()
                : "Unknown",
            },
            {
              label: "Reported By",
              value: selectedReport.reporter ? (
                <UserProfileLink
                  userId={selectedReport.reporter._id}
                  username={selectedReport.reporter.username || "Unknown User"}
                  profilePic={selectedReport.reporter.profilePic}
                  showAvatar={true}
                  linkClassName="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                />
              ) : (
                "Unknown Reporter"
              ),
            },
            ...(selectedReport.targetOwner?.username
              ? [
                  {
                    label: "Content Author/Owner",
                    value: (
                      <UserProfileLink
                        userId={selectedReport.targetOwner._id}
                        username={
                          selectedReport.targetOwner.username || "Unknown User"
                        }
                        profilePic={selectedReport.targetOwner.profilePic}
                        showAvatar={true}
                        linkClassName="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      />
                    ),
                  },
                ]
              : []),
          ]}
          actions={
            selectedReport.status === "pending"
              ? [
                  {
                    label: "Approve Report",
                    onClick: () => handleReportAction("resolve"),
                    variant: "primary" as const,
                    loading: Boolean(
                      reportPendingActions[selectedReport._id] === "resolve",
                    ),
                  },
                  {
                    label: "Dismiss Report",
                    onClick: () => handleReportAction("reject"),
                    variant: "secondary" as const,
                    loading: Boolean(
                      reportPendingActions[selectedReport._id] === "reject",
                    ),
                  },
                  ...(selectedReport.targetType === "post"
                    ? [
                        {
                          label: "Delete Post",
                          onClick: () => handleReportAction("delete_post"),
                          variant: "danger" as const,
                          loading: Boolean(
                            reportPendingActions[selectedReport._id] ===
                            "delete_post",
                          ),
                        },
                      ]
                    : []),
                  ...(selectedReport.targetType === "comment"
                    ? [
                        {
                          label: "Delete Comment",
                          onClick: () => handleReportAction("delete_comment"),
                          variant: "danger" as const,
                          loading: Boolean(
                            reportPendingActions[selectedReport._id] ===
                            "delete_comment",
                          ),
                        },
                      ]
                    : []),
                  ...(selectedReport.targetType === "user"
                    ? [
                        {
                          label: "Suspend User",
                          onClick: () => handleReportAction("suspend_user"),
                          variant: "warning" as const,
                          loading: Boolean(
                            reportPendingActions[selectedReport._id] ===
                            "suspend_user",
                          ),
                        },
                        {
                          label: "Delete User",
                          onClick: () => handleReportAction("delete_user"),
                          variant: "danger" as const,
                          loading: Boolean(
                            reportPendingActions[selectedReport._id] ===
                            "delete_user",
                          ),
                        },
                        {
                          label: "Warn User",
                          onClick: () => handleReportAction("warn_user"),
                          variant: "warning" as const,
                          loading: Boolean(
                            reportPendingActions[selectedReport._id] ===
                            "warn_user",
                          ),
                        },
                      ]
                    : []),
                ]
              : [
                  {
                    label: "Already Resolved",
                    onClick: () => {},
                    variant: "secondary" as const,
                    loading: false,
                  },
                ]
          }
        />
      )}

      {/* Report Action Modal */}
      {selectedReport && (
        <ReportActionModal
          isOpen={actionModal.isOpen}
          action={actionModal.action}
          targetType={selectedReport.targetType}
          targetInfo={{
            title:
              selectedReport.targetEntity?.post ||
              selectedReport.targetEntity?.content ||
              selectedReport.targetOwner?.username,
            author: selectedReport.targetOwner?.username,
            reason: selectedReport.reason,
          }}
          isLoading={actionModal.isLoading}
          onConfirm={handleConfirmReportAction}
          onCancel={() =>
            setActionModal({
              isOpen: false,
              action: null,
              reportId: null,
              isLoading: false,
            })
          }
        />
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        itemTitle={rejectionModal.itemTitle}
        itemType={rejectionModal.itemType}
        onClose={() => setRejectionModal({ ...rejectionModal, isOpen: false })}
        onSubmit={handleConfirmReject}
      />

      {/* View Post Modal */}
      <ViewPostModal
        postId={viewPostModal.postId}
        isOpen={viewPostModal.isOpen}
        onClose={() => setViewPostModal({ isOpen: false, postId: "" })}
      />

      {/* View Comment Modal */}
      <ViewCommentModal
        postId={viewCommentModal.postId}
        commentId={viewCommentModal.commentId}
        isOpen={viewCommentModal.isOpen}
        onClose={() =>
          setViewCommentModal({ isOpen: false, postId: "", commentId: "" })
        }
      />
    </DashboardLayout>
  );
}
