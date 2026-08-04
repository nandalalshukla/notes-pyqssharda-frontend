"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white px-4 py-4 flex flex-col gap-4 sm:px-6 sm:py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && <div className="mt-0.5 shrink-0 text-slate-700">{icon}</div>}
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-slate-600 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={`text-slate-600 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          )}
          {headerAction}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
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
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Tab List */}
      <div className="flex gap-1 border-b border-slate-100 overflow-x-auto bg-slate-50 px-3 sm:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              px-4 py-3 sm:py-4 font-medium text-sm
              border-b-2 transition-all duration-200
              flex items-center gap-2 whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }
            `}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`
                  ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold
                  ${
                    activeTab === tab.id
                      ? "bg-blue-200 text-blue-800"
                      : "bg-slate-200 text-slate-700"
                  }
                `}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
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
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="flex flex-wrap gap-4">{children}</div>}
    </div>
  );
};
