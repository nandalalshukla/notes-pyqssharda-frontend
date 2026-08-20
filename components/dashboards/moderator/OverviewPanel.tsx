import { SectionCard } from "@/components/dashboards/SectionCard";
import type { PendingSubmission, SubmissionType } from "@/stores/mod/submissions.store";
import type { ReportListItem } from "@/lib/api/mod/mod.api";

interface SubmissionWithType extends PendingSubmission {
  submissionType: SubmissionType;
}

interface OverviewPanelProps {
  submissions: SubmissionWithType[];
  reports: ReportListItem[];
}

export default function OverviewPanel({ submissions, reports }: OverviewPanelProps) {
  return (
    <div className="mt-8 space-y-6">
      <SectionCard title="Quick Stats" description="Moderation health snapshot">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Approval Rate</p>
            <p className="text-2xl font-bold text-foreground">
              {submissions.length > 0
                ? Math.round(
                    (submissions.filter((s) => s.status === "approved").length /
                      submissions.length) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
          <div className="p-4 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Pending Items</p>
            <p className="text-2xl font-bold text-foreground">
              {submissions.length + reports.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="p-4 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Avg Response</p>
            <p className="text-2xl font-bold text-foreground">—</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
