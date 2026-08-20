import { SectionCard } from "@/components/dashboards/SectionCard";
import type { AdminUser } from "@/stores/admin/users.store";

interface OverviewPanelProps {
  users: AdminUser[];
  mods: AdminUser[];
}

export default function OverviewPanel({ users, mods }: OverviewPanelProps) {
  return (
    <div className="mt-8 space-y-6">
      <SectionCard title="Quick Stats" description="Platform health at a glance">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Email Verified</p>
            <p className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.isEmailVerified).length}
            </p>
          </div>
          <div className="p-4 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Verified Users</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(
                (users.filter((u) => u.isEmailVerified).length /
                  (users.length || 1)) *
                  100,
              )}
              %
            </p>
          </div>
          <div className="p-4 border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Mod Coverage</p>
            <p className="text-2xl font-bold text-foreground">
              {mods.length > 0 ? Math.round((mods.length / users.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
