"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { DataTable, DataTableColumn, Button, Input } from "@/components/ui";
import type { ModRequest } from "@/stores/admin/modRequests.store";

interface RequestsPanelProps {
  requests: ModRequest[];
  isLoading: boolean;
  pendingActions: Record<string, "approve" | "reject">;
  onProcess: (id: string, action: "approve" | "reject") => void;
}

export default function RequestsPanel({
  requests,
  isLoading,
  pendingActions,
  onProcess,
}: RequestsPanelProps) {
  const [search, setSearch] = useState("");

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [requests, search],
  );

  const columns: DataTableColumn<ModRequest>[] = [
    {
      id: "name",
      header: "Requester",
      accessor: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "motivation",
      header: "Motivation",
      accessor: (row) => (
        <p className="text-sm text-muted-foreground line-clamp-1">
          {row.modMotivation || "—"}
        </p>
      ),
    },
    {
      id: "date",
      header: "Requested",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.modRequestAt || "").toLocaleDateString()}
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
            onClick={() => onProcess(row._id, "approve")}
            disabled={Boolean(pendingActions[row._id])}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            icon={<XCircle size={14} />}
            onClick={() => onProcess(row._id, "reject")}
            disabled={Boolean(pendingActions[row._id])}
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
        title="Moderator Requests"
        description={`Pending: ${filteredRequests.length} request${filteredRequests.length !== 1 ? "s" : ""}`}
      >
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>
      <SectionCard title="Pending Requests" icon={<Clock size={20} />}>
        <DataTable
          columns={columns}
          data={filteredRequests}
          isLoading={isLoading}
          searchable={false}
          paginated
          pageSize={15}
          emptyTitle="No pending requests"
        />
      </SectionCard>
    </div>
  );
}
