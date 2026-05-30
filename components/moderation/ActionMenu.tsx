import React from "react";

interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

interface ActionMenuProps {
  items: ActionItem[];
}

export default function ActionMenu({ items }: ActionMenuProps) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
        Actions
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
        {items.map((item) => {
          const isBusy = Boolean(item.loading);
          const isDisabled = Boolean(item.disabled || item.loading);
          const label = isBusy
            ? item.loadingLabel || `${item.label}...`
            : item.label;

          return (
            <button
              key={item.label}
              onClick={item.onClick}
              disabled={isDisabled}
              aria-busy={isBusy}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                isDisabled
                  ? "cursor-not-allowed text-slate-400"
                  : item.variant === "danger"
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
