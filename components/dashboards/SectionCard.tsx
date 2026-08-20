"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  headerAction,
  children,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm transition-shadow duration-300 hover:shadow-soft-md">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>}
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground sm:text-lg">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
          )}
          {headerAction}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </div>
  );
};

interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm">
      {/* Tab List */}
      <div className="flex gap-1 overflow-x-auto border-b border-border bg-muted px-3 sm:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 sm:py-4 cursor-pointer",
              activeTab === tab.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2.5 py-0.5 text-xs font-bold",
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

interface ToolbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  title,
  description,
  actions,
  children,
}) => {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="flex flex-wrap gap-4">{children}</div>}
    </div>
  );
};
