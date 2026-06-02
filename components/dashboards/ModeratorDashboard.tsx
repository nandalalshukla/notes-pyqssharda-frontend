"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import RejectionModal from "@/components/modals/RejectionModal";
import { DashboardLayout } from "@/components/dashboards/DashboardLayout";
import { StatCard, StatsGrid } from "@/components/dashboards/StatCard";
import { DataTable, DataTableColumn } from "@/components/dashboards/DataTable";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
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
  Ban,
  TrendingUp,
} from "lucide-react";
import type {
  PendingSubmission,
  SubmissionType,
} from "@/stores/mod/submissions.store";
import type {
  ReportListItem,
  ReportAction,
} from "@/lib/api/mod/mod.api";

interface RejectionModalState {
  isOpen: boolean;
  itemId: string;
  itemType: SubmissionType;
  itemTitle: string;
}

interface SubmissionWithType extends PendingSubmission {
  submissionType: SubmissionType;
}

export default function ModeratorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeNav, setActiveNav] = useState("overview");
  const [rejectionModal, setRejectionModal] = useState<RejectionModalState>({
    isOpen: false,
    itemId: "",
    itemType: "note",
    itemTitle: "",
  });
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");

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
          allSubmissions.push({ ...entity, submissionType: type });
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
          r.targetEntity?.content?.toLowerCase().includes(reportSearch.toLowerCase()) ||
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
      description: "Reviewed today",
    },
    {
      label: "Resolution Rate",
      value:
        reports.length > 0
          ? Math.round(
              (reports.filter((r) => r.status !== "pending").length / reports.length) * 100,
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
    } catch (error) {
      toast.error("Failed to approve submission");
    }
  };

  const handleRejectSubmission = (id: string, title: string, type: SubmissionType) => {
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
      setRejectionModal({ ...rejectionModal, isOpen: false });
    } catch (error) {
      toast.error("Failed to reject submission");
    }
  };

  const handleReportAction = async (reportId: string, action: ReportAction) => {
    try {
      await applyReportAction(reportId, action);
      toast.success(`Report action completed: ${action}`);
    } catch (error) {
      toast.error("Failed to apply report action");
    }
  };

  // Table columns for submissions
  const submissionColumns: DataTableColumn<SubmissionWithType>[] = [
    {
      id: "title",
      header: "Content",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-900 line-clamp-1">{row.title}</p>
          <p className="text-xs text-slate-500 capitalize">{row.submissionType}</p>
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
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleApproveSubmission(row._id, row.submissionType)}
            disabled={Boolean(
              submissionPendingActions[
                getSubmissionActionKey(row.submissionType, row._id)
              ],
            )}
            className="px-3 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 flex items-center gap-1"
          >
            <CheckCircle size={14} /> Approve
          </button>
          <button
            onClick={() => handleRejectSubmission(row._id, row.title, row.submissionType)}
            className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  // Table columns for reports
  const reportColumns: DataTableColumn<ReportListItem>[] = [
    {
      id: "target",
      header: "Target",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-900 line-clamp-1">
            {row.targetType === "user"
              ? row.targetEntity?.username || "Unknown User"
              : row.targetEntity?.content || "Unknown"}
          </p>
          <p className="text-xs text-slate-500 capitalize">{row.targetType}</p>
        </div>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      accessor: (row) => (
        <span className="text-sm text-slate-600 line-clamp-1">{row.reason}</span>
      ),
    },
    {
      id: "reporter",
      header: "Reported By",
      accessor: (row) =>
        row.reporter ? (
          <UserProfileLink
            userId={row.reporter._id}
            username={row.reporter.username || "Unknown"}
            profilePic={row.reporter.profilePic}
            showAvatar={false}
            linkClassName="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm"
          />
        ) : (
          <span className="text-sm text-slate-500">Unknown</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
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
    {
      id: "actions",
      header: "Actions",
      accessor: (row) =>
        row.status === "pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleReportAction(row._id, "resolve")}
              disabled={Boolean(reportPendingActions[row._id])}
              className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
            >
              Resolve
            </button>
            <button
              onClick={() => handleReportAction(row._id, "reject")}
              disabled={Boolean(reportPendingActions[row._id])}
              className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Resolved</span>
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
      id: "submissions",
      label: "Pending Submissions",
      icon: <FileText size={20} />,
      badge: submissions.length,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <AlertCircle size={20} />,
      badge: reports.filter((r) => r.status === "pending").length,
    },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      activeNavId={activeNav}
      onNavChange={setActiveNav}
      title="Moderator Dashboard"
      subtitle="Review submissions and manage user reports"
      userRole={`${user?.role} • ${user?.name}`}
    >
      {/* Stats Grid - Always visible */}
      <StatsGrid stats={stats} columns={4} />

      {/* Overview Section */}
      {activeNav === "overview" && (
        <div className="mt-8 space-y-6">
          <SectionCard title="Quick Stats" description="Moderation health snapshot">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {submissions.length > 0
                    ? Math.round((submissions.filter(s => s.status === "approved").length / submissions.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Pending Items</p>
                <p className="text-2xl font-bold">{submissions.length + reports.filter(r => r.status === "pending").length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600">Avg Response</p>
                <p className="text-2xl font-bold">—</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Submissions Section */}
      {activeNav === "submissions" && (
        <div className="mt-8 space-y-6">
          <Toolbar
            title="Pending Submissions"
            description={`Review ${filteredSubmissions.length} submissions`}
          >
            <input
              type="text"
              placeholder="Search by title or type..."
              value={submissionSearch}
              onChange={(e) => setSubmissionSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </Toolbar>
          <SectionCard title="Content Queue" icon={<Clock size={20} />}>
            <DataTable
              columns={submissionColumns}
              data={filteredSubmissions}
              isLoading={submissionLoading}
              searchable={false}
              paginated
              pageSize={15}
              emptyMessage="No pending submissions"
            />
          </SectionCard>
        </div>
      )}

      {/* Reports Section */}
      {activeNav === "reports" && (
        <div className="mt-8 space-y-6">
          <Toolbar
            title="User Reports"
            description={`Process ${filteredReports.length} reports`}
          >
            <input
              type="text"
              placeholder="Search by target or reason..."
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </Toolbar>
          <SectionCard title="Report Queue" icon={<AlertCircle size={20} />}>
            <DataTable
              columns={reportColumns}
              data={filteredReports}
              isLoading={reportsLoading}
              searchable={false}
              paginated
              pageSize={15}
              emptyMessage="No reports found"
            />
          </SectionCard>
        </div>
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        itemTitle={rejectionModal.itemTitle}
        itemType={rejectionModal.itemType}
        onClose={() => setRejectionModal({ ...rejectionModal, isOpen: false })}
        onSubmit={handleConfirmReject}
      />
    </DashboardLayout>
  );
}

