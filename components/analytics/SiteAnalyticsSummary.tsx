"use client";

import { useSyncExternalStore } from "react";
import { FiEye } from "react-icons/fi";
import {
  getSiteMetricsSnapshot,
  subscribeToSiteMetrics,
} from "@/lib/siteMetrics";

const formatCompactCount = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);

export default function SiteAnalyticsSummary() {
  const metrics = useSyncExternalStore(
    subscribeToSiteMetrics,
    getSiteMetricsSnapshot,
    () => null,
  );

  return (
    <header className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-3 gap-y-3 px-4 pb-4 pt-7 sm:px-6 lg:px-8">
      <h1 className="text-[21px] font-black tracking-tight text-foreground sm:text-2xl">
        Sharda Social
      </h1>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          aria-label={
            metrics
              ? `${metrics.onlineNow} currently online`
              : "Online visitor count loading"
          }
          title="Visitors active in the last 90 seconds"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]" />
          <span>{metrics ? metrics.onlineNow : "—"} online</span>
        </div>
        <div
          aria-label={
            metrics
              ? `${metrics.totalPageViews.toLocaleString()} total page views`
              : "Page view count loading"
          }
          title="Total Sharda Social page views"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1.5 text-xs font-medium text-muted-foreground sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
        >
          <FiEye aria-hidden="true" size={15} />
          <span>
            {metrics
              ? `${formatCompactCount(metrics.totalPageViews)}${metrics.totalPageViews >= 1_000 ? "+" : ""}`
              : "—"}{" "}
            views
          </span>
        </div>
      </div>
    </header>
  );
}
