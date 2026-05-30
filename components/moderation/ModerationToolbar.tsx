import React from "react";

interface ModerationToolbarProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function ModerationToolbar({
  title,
  description,
  children,
}: ModerationToolbarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:justify-end">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
