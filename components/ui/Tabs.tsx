import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-2 overflow-x-auto", className)}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors cursor-pointer",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {Icon && <Icon size={16} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
