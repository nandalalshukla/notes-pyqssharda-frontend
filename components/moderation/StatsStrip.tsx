import React from "react";

interface StatItem {
  label: string;
  value: number | string;
}

interface StatsStripProps {
  items: StatItem[];
}

export default function StatsStrip({ items }: StatsStripProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
