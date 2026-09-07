"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-hot-toast";
import useAuthStore from "@/stores/user/authStore";
import { DashboardLayout } from "@/components/dashboards/DashboardLayout";
import { StatsGrid } from "@/components/dashboards/StatCard";
import OverviewPanel from "@/components/dashboards/moderator/OverviewPanel";
import SubmissionsPanel from "@/components/dashboards/moderator/SubmissionsPanel";
import ReportsPanel from "@/components/dashboards/moderator/ReportsPanel";
import PendingPostsPanel from "@/components/dashboards/moderator/PendingPostsPanel";
import {
  useModSubmissionsStore,
  type PendingSubmission,
  type SubmissionType,
} from "@/stores/mod/submissions.store";
import { useModReportsStore } from "@/stores/mod/reports.store";
import { useModPendingPostsStore } from "@/stores/mod/pendingPosts.store";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  Megaphone,
} from "lucide-react";

interface SubmissionWithType extends PendingSubmission {
  submissionType: SubmissionType;
}

export default function ModeratorDashboard() {
  const { user } = useAuthStore();
  const [activeNav, setActiveNav] = useState("overview");

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
      submissionLoading: Object.values(state.isLoading).some((loading) => loading),
      submissionPendingActions: state.pendingActions,
      fetchAllPending: state.fetchAllPending,
      approveSubmission: state.approveSubmission,
      rejectSubmission: state.rejectSubmission,
    })),
  );

  const {
    pendingPostEntities,
    pendingPostIds,
    pendingPostsLoading,
    pendingPostsError,
    pendingPostActions,
    fetchPendingPosts,
    approvePendingPost,
    rejectPendingPost,
  } = useModPendingPostsStore(
    useShallow((state) => ({
      pendingPostEntities: state.entities,
      pendingPostIds: state.ids,
      pendingPostsLoading: state.isLoading,
      pendingPostsError: state.error,
      pendingPostActions: state.pendingActions,
      fetchPendingPosts: state.fetchPendingPosts,
      approvePendingPost: state.approvePendingPost,
      rejectPendingPost: state.rejectPendingPost,
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

  const pendingPosts = useMemo(
    () => pendingPostIds.map((id) => pendingPostEntities[id]).filter(Boolean),
    [pendingPostIds, pendingPostEntities],
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
      label: "Posts to Review",
      value: pendingPosts.length,
      icon: <Megaphone size={24} />,
      variant: "warning" as const,
      description: "Events & announcements",
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
    fetchPendingPosts();
  }, [fetchAllPending, fetchReports, fetchPendingPosts]);

  useEffect(() => {
    if (reportsError) {
      toast.error(reportsError);
    }
  }, [reportsError]);

  useEffect(() => {
    if (pendingPostsError) {
      toast.error(pendingPostsError);
    }
  }, [pendingPostsError]);

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
      id: "posts",
      label: "Pending Posts",
      icon: <Megaphone size={20} />,
      badge: pendingPosts.length,
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
      <StatsGrid stats={stats} columns={5} />

      {activeNav === "overview" && (
        <OverviewPanel submissions={submissions} reports={reports} />
      )}

      {activeNav === "submissions" && (
        <SubmissionsPanel
          submissions={submissions}
          isLoading={submissionLoading}
          pendingActions={submissionPendingActions}
          approveSubmission={approveSubmission}
          rejectSubmission={rejectSubmission}
        />
      )}

      {activeNav === "posts" && (
        <PendingPostsPanel
          posts={pendingPosts}
          isLoading={pendingPostsLoading}
          pendingActions={pendingPostActions}
          approvePost={approvePendingPost}
          rejectPost={rejectPendingPost}
        />
      )}

      {activeNav === "reports" && (
        <ReportsPanel
          reports={reports}
          isLoading={reportsLoading}
          pendingActions={reportPendingActions}
          applyReportAction={applyReportAction}
        />
      )}
    </DashboardLayout>
  );
}
