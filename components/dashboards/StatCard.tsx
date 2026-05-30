"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  primary: "bg-blue-50 border-blue-200 text-blue-600",
  success: "bg-emerald-50 border-emerald-200 text-emerald-600",
  warning: "bg-amber-50 border-amber-200 text-amber-600",
  danger: "bg-red-50 border-red-200 text-red-600",
};

const iconVariantStyles = {
  primary: "bg-blue-100 text-blue-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  danger: "bg-red-100 text-red-600",
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
      className={`border rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-105 duration-300 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconVariantStyles[variant]}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-sm font-bold ${
              trend === "up" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            {trendValue}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
      <p className="text-4xl font-bold text-slate-900 mb-2">{value}</p>
      {description && (
        <p className="text-xs text-slate-600 font-medium">{description}</p>
      )}
    </div>
  );
};

interface StatsGridProps {
  stats: StatCardProps[];
  columns?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = 4 }) => {
  return (
    <div
      className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(
        columns,
        4,
      )}`}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
