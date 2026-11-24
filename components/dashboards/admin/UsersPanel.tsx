"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { DataTable, DataTableColumn, Badge, Button, Input } from "@/components/ui";
import type { AdminUser } from "@/stores/admin/users.store";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface UsersPanelProps {
  users: AdminUser[];
  isLoading: boolean;
  pendingActions: Record<string, "activate" | "deactivate" | "delete">;
  pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean } | null;
  onFetchUsers: (params: { page?: number; query?: string }) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export default function UsersPanel({
  users,
  isLoading,
  pendingActions,
  pagination,
  onFetchUsers,
  onToggleStatus,
  onDelete,
}: UsersPanelProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const page = pagination?.page ?? 1;

  useEffect(() => {
    onFetchUsers({ page: 1, query: debouncedSearch || undefined });
  }, [debouncedSearch, onFetchUsers]);

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "name",
      header: "User",
      accessor: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "contributions",
      header: "Contributions",
      accessor: (row) => <span className="font-medium text-foreground">{row.contributions || 0}</span>,
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.isActive ? "success" : "destructive"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "emailVerified",
      header: "Email",
      accessor: (row) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={row.isEmailVerified ? "success" : "warning"}>
            {row.isEmailVerified ? "Verified" : "Not verified"}
          </Badge>
          {!row.isEmailVerified && (
            <span className="text-xs text-muted-foreground">
              Verification required
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onToggleStatus(row._id, row.isActive)}
            disabled={Boolean(pendingActions[row._id])}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row._id)}
            disabled={Boolean(pendingActions[row._id])}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <Toolbar title="User Management" description={`Total: ${(pagination?.total ?? 0).toLocaleString()} users`}>
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>
      <SectionCard title="All Users" icon={<Users size={20} />}>
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          searchable={false}
          paginated={false}
          emptyTitle="No users found"
        />
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => onFetchUsers({ page: page - 1, query: debouncedSearch || undefined })}>Previous</Button>
            <span className="text-sm font-semibold text-muted-foreground">Page {page} of {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={!pagination.hasMore || isLoading} onClick={() => onFetchUsers({ page: page + 1, query: debouncedSearch || undefined })}>Next</Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
