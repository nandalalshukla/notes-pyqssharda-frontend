import React from "react";

interface ModerationShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function ModerationShell({
  title,
  subtitle,
  actions,
  children,
}: ModerationShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Moderation Center
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600 md:text-base">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}
