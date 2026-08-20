"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { CheckCircle, Clock } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { DataTable, DataTableColumn, Button, Input } from "@/components/ui";
import {
  getSubmissionActionKey,
  type PendingSubmission,
  type SubmissionType,
} from "@/stores/mod/submissions.store";

const RejectionModal = dynamic(() => import("@/components/modals/RejectionModal"));

interface SubmissionWithType extends PendingSubmission {
  submissionType: SubmissionType;
}

interface RejectionModalState {
  isOpen: boolean;
  itemId: string;
  itemType: SubmissionType;
  itemTitle: string;
}

interface SubmissionsPanelProps {
  submissions: SubmissionWithType[];
  isLoading: boolean;
  pendingActions: Record<string, "approve" | "reject">;
  approveSubmission: (id: string, type: SubmissionType) => Promise<void>;
  rejectSubmission: (
    id: string,
    type: SubmissionType,
    reason: string,
  ) => Promise<void>;
}

export default function SubmissionsPanel({
  submissions,
  isLoading,
  pendingActions,
  approveSubmission,
  rejectSubmission,
}: SubmissionsPanelProps) {
  const [search, setSearch] = useState("");
  const [rejectionModal, setRejectionModal] = useState<RejectionModalState>({
    isOpen: false,
    itemId: "",
    itemType: "note",
    itemTitle: "",
  });

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter(
        (s) =>
          s.title?.toLowerCase().includes(search.toLowerCase()) ||
          s.submissionType.includes(search.toLowerCase()),
      ),
    [submissions, search],
  );

  const handleApprove = async (id: string, type: SubmissionType) => {
    try {
      await approveSubmission(id, type);
      toast.success("Submission approved");
    } catch {
      toast.error("Failed to approve submission");
    }
  };

  const handleReject = (id: string, title: string, type: SubmissionType) => {
    setRejectionModal({ isOpen: true, itemId: id, itemType: type, itemTitle: title });
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      await rejectSubmission(rejectionModal.itemId, rejectionModal.itemType, reason);
      toast.success("Submission rejected");
      setRejectionModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      toast.error("Failed to reject submission");
    }
  };

  const columns: DataTableColumn<SubmissionWithType>[] = [
    {
      id: "title",
      header: "Content",
      accessor: (row) => (
        <div>
          <p className="font-medium text-foreground line-clamp-1">{row.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{row.submissionType}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "createdAt",
      header: "Submitted",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
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
          <Button
            size="sm"
            variant="secondary"
            icon={<CheckCircle size={14} />}
            onClick={() => handleApprove(row._id, row.submissionType)}
            disabled={Boolean(
              pendingActions[getSubmissionActionKey(row.submissionType, row._id)],
            )}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleReject(row._id, row.title, row.submissionType)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <Toolbar
        title="Pending Submissions"
        description={`Review ${filteredSubmissions.length} submissions`}
      >
        <Input
          type="text"
          placeholder="Search by title or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>
      <SectionCard title="Content Queue" icon={<Clock size={20} />}>
        <DataTable
          columns={columns}
          data={filteredSubmissions}
          isLoading={isLoading}
          searchable={false}
          paginated
          pageSize={15}
          emptyTitle="No pending submissions"
        />
      </SectionCard>

      <RejectionModal
        isOpen={rejectionModal.isOpen}
        itemTitle={rejectionModal.itemTitle}
        itemType={rejectionModal.itemType}
        onClose={() => setRejectionModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleConfirmReject}
      />
    </div>
  );
}
