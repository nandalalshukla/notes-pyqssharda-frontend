"use client";

import { useMemo, useState } from "react";
import { TrendingUp, UserCheck } from "lucide-react";
import { SectionCard, Toolbar } from "@/components/dashboards/SectionCard";
import { DataTable, DataTableColumn, Badge, Button, Input } from "@/components/ui";
import type { AdminUser } from "@/stores/admin/users.store";

interface ModsPanelProps {
  mods: AdminUser[];
  isLoading: boolean;
  pendingActions: Record<string, "remove">;
  onRemoveRole: (id: string) => void;
}

export default function ModsPanel({
  mods,
  isLoading,
  pendingActions,
  onRemoveRole,
}: ModsPanelProps) {
  const [search, setSearch] = useState("");

  const filteredMods = useMemo(
    () =>
      mods.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [mods, search],
  );

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "name",
      header: "Moderator",
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
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <span className="font-medium text-foreground">{row.contributions || 0}</span>
        </div>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.isActive ? "success" : "warning"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onRemoveRole(row._id)}
          disabled={Boolean(pendingActions[row._id])}
        >
          Remove Role
        </Button>
      ),
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <Toolbar
        title="Moderator Management"
        description={`Active: ${filteredMods.filter((m) => m.isActive).length} / ${filteredMods.length}`}
      >
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </Toolbar>
      <SectionCard title="Moderators" icon={<UserCheck size={20} />}>
        <DataTable
          columns={columns}
          data={filteredMods}
          isLoading={isLoading}
          searchable={false}
          paginated
          pageSize={15}
          emptyTitle="No moderators found"
        />
      </SectionCard>
    </div>
  );
}
