"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  trendValue?: number;
  description?: string;
  variant?: "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  primary: "bg-primary/10 border-primary/20 text-primary",
  success: "bg-success/10 border-success/20 text-success",
  warning: "bg-warning/10 border-warning/20 text-warning",
  danger: "bg-destructive/10 border-destructive/20 text-destructive",
};

const iconVariantStyles = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  description,
  variant = "primary",
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-300 hover:shadow-soft-md sm:p-5 sm:hover:scale-[1.03] lg:p-6",
        variantStyles[variant],
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5 sm:p-3", iconVariantStyles[variant])}>{icon}</div>
        {trend && trendValue && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-bold",
              trend === "up" ? "text-success" : "text-destructive",
            )}
          >
            {trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trendValue}%
          </div>
        )}
      </div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">{value}</p>
      {description && (
        <p className="text-xs font-medium text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

interface StatsGridProps {
  stats: StatCardProps[];
  columns?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = 4 }) => {
  const gridColumnsClass =
    columns >= 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1";

  return (
    <div className={cn("grid gap-4 sm:gap-5 lg:gap-6", gridColumnsClass)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
