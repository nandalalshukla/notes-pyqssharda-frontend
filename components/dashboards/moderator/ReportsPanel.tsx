"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { UserProfileLink } from "@/components/shared/UserProfileLink";
import { DataTable, DataTableColumn, Badge, Button, Input } from "@/components/ui";
import type { ReportListItem, ReportAction } from "@/lib/api/mod/mod.api";

const ReportTargetModal = dynamic(() => import("@/components/modals/ReportTargetModal"));
const ReportActionModal = dynamic(() =>
  import("@/components/modals/ReportActionModal").then((m) => m.ReportActionModal),
);

interface ReportsPanelProps {
  reports: ReportListItem[];
  isLoading: boolean;
  pendingActions: Record<string, ReportAction>;
  applyReportAction: (reportId: string, action: ReportAction) => Promise<void>;
}

export default function ReportsPanel({
  reports,
  isLoading,
  pendingActions,
  applyReportAction,
}: ReportsPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null);
  const [selectedReportAction, setSelectedReportAction] = useState<ReportAction | null>(
    null,
  );

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.reason?.toLowerCase().includes(search.toLowerCase()) ||
          r.targetEntity?.content?.toLowerCase().includes(search.toLowerCase()) ||
          r.targetType?.includes(search.toLowerCase()),
      ),
    [reports, search],
  );

  const handleReportAction = async (reportId: string, action: ReportAction) => {
    try {
      await applyReportAction(reportId, action);
      toast.success("Report action completed");
      setSelectedReport(null);
      setSelectedReportAction(null);
    } catch {
      toast.error("Failed to apply report action");
    }
  };

  const columns: DataTableColumn<ReportListItem>[] = [
    {
      id: "target",
      header: "Target",
      accessor: (row) => (
        <button
          type="button"
          onClick={() => setSelectedReport(row)}
          className="text-left hover:text-primary cursor-pointer"
        >
          <p className="font-medium text-foreground line-clamp-1">
            {row.targetType === "user"
              ? row.targetEntity?.username || "Unknown User"
              : row.targetEntity?.content || "Unknown"}
          </p>
          <p className="text-xs capitalize text-primary">View {row.targetType}</p>
        </button>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground line-clamp-1">{row.reason}</span>
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
            linkClassName="text-primary hover:text-primary-hover hover:underline font-medium text-sm"
          />
        ) : (
          <span className="text-sm text-muted-foreground">Unknown</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge
          variant={
            row.status === "pending"
              ? "warning"
              : row.status === "resolved" || row.status === "reviewed"
                ? "success"
                : "destructive"
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
        <Button size="sm" variant="secondary" onClick={() => setSelectedReport(row)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <Toolbar title="User Reports" description={`Process ${filteredReports.length} reports`}>
        <Input
          type="text"
          placeholder="Search by target or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>
      <SectionCard title="Report Queue" icon={<AlertCircle size={20} />}>
        <DataTable
          columns={columns}
          data={filteredReports}
          isLoading={isLoading}
          searchable={false}
          paginated
          pageSize={15}
          emptyTitle="No reports found"
        />
      </SectionCard>

      <ReportTargetModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        pendingAction={selectedReport ? pendingActions[selectedReport._id] : undefined}
        onAction={setSelectedReportAction}
        onClose={() => setSelectedReport(null)}
      />

      <ReportActionModal
        isOpen={Boolean(selectedReport && selectedReportAction)}
        action={selectedReportAction}
        targetType={selectedReport?.targetType || null}
        targetInfo={
          selectedReport
            ? {
                title:
                  selectedReport.targetType === "user"
                    ? selectedReport.targetEntity?.username
                    : selectedReport.targetEntity?.content,
                author: selectedReport.targetOwner?.username,
                reason: selectedReport.reason,
              }
            : undefined
        }
        isLoading={Boolean(selectedReport && pendingActions[selectedReport._id])}
        onConfirm={async () => {
          if (selectedReport && selectedReportAction) {
            await handleReportAction(selectedReport._id, selectedReportAction);
          }
        }}
        onCancel={() => setSelectedReportAction(null)}
      />
    </div>
  );
}
