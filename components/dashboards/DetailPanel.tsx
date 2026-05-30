"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";

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
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
  warning: "bg-amber-600 hover:bg-amber-700 text-white",
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
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-0 bottom-0 z-50
          bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          ${widthMap[width]}
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0 text-slate-600"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {children ? (
            children
          ) : (
            <>
              {/* Fields */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {field.icon && (
                        <div className="text-slate-600 text-lg">{field.icon}</div>
                      )}
                      <label className="text-sm font-semibold text-slate-900">
                        {field.label}
                      </label>
                      {field.badge && (
                        <span className="ml-auto px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {field.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-700 text-sm">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={action.loading}
                      className={`
                        w-full px-4 py-3 rounded-lg font-medium text-sm
                        transition-all duration-200
                        flex items-center justify-center gap-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-sm
                        ${variantStyles[action.variant || "primary"]}
                      `}
                    >
                      {action.loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
