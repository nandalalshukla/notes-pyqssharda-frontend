"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DetailField {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
}

export interface DetailPanelAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "danger" | "secondary" | "warning";
  loading?: boolean;
}

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
  actions?: DetailPanelAction[];
  children?: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

const widthMap = {
  md: "w-80",
  lg: "w-96",
  xl: "w-[500px]",
};

const variantStyles = {
  primary: "bg-primary hover:bg-primary-hover text-primary-foreground",
  danger: "bg-destructive hover:opacity-90 text-destructive-foreground",
  secondary: "bg-secondary hover:bg-secondary-hover text-secondary-foreground",
  warning: "bg-warning hover:opacity-90 text-warning-foreground",
};

export const DetailPanel: React.FC<DetailPanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  actions,
  children,
  width = "lg",
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 overflow-y-auto bg-card shadow-soft-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          widthMap[width],
        )}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between border-b border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {children ? (
            children
          ) : (
            <>
              {/* Fields */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {field.icon && (
                        <div className="text-lg text-muted-foreground">{field.icon}</div>
                      )}
                      <label className="text-sm font-semibold text-foreground">
                        {field.label}
                      </label>
                      {field.badge && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                          {field.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-foreground">{field.value}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="space-y-2.5 border-t border-border pt-4">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={action.loading}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:shadow-soft-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                        variantStyles[action.variant || "primary"],
                      )}
                    >
                      {action.loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {action.label}
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailPanel;
