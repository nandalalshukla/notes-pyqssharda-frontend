"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { DataTable, DataTableColumn, Badge, Button, Input } from "@/components/ui";
import type { AdminUser } from "@/stores/admin/users.store";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface UsersPanelProps {
  users: AdminUser[];
  isLoading: boolean;
  pendingActions: Record<string, "activate" | "deactivate" | "delete">;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export default function UsersPanel({
  users,
  isLoading,
  pendingActions,
  onToggleStatus,
  onDelete,
}: UsersPanelProps) {
  const [search, setSearch] = useState("");
  // The table below re-filters and re-renders every row on each
  // change; with a few thousand rows loaded that is enough work per
  // keystroke to make typing feel sticky. The input stays bound to
  // `search` so it still updates instantly.
  const debouncedSearch = useDebouncedValue(search, 250);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [users, debouncedSearch],
  );

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
      <Toolbar title="User Management" description={`Total: ${filteredUsers.length} users`}>
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
          data={filteredUsers}
          isLoading={isLoading}
          searchable={false}
          paginated
          pageSize={15}
          emptyTitle="No users found"
        />
      </SectionCard>
    </div>
  );
}
