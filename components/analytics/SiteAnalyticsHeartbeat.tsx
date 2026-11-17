"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api/axios";
import { publishSiteMetrics } from "@/lib/siteMetrics";

const HEARTBEAT_INTERVAL_MS = 45_000;
let fallbackBrowserId: string | null = null;
let currentPageView: { pathname: string; id: string } | null = null;

const createId = () => crypto.randomUUID();

const getPageViewId = (pathname: string) => {
  if (!currentPageView || currentPageView.pathname !== pathname) {
    currentPageView = { pathname, id: createId() };
  }
  return currentPageView.id;
};

const getBrowserId = () => {
  try {
    const existing = window.localStorage.getItem("site-analytics-browser-id");
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;

    const id = createId();
    window.localStorage.setItem("site-analytics-browser-id", id);
    return id;
  } catch {
    // Storage can be disabled in private browsing. Keep a tab-local identity
    // so presence still works without making the page depend on storage.
    fallbackBrowserId ??= createId();
    return fallbackBrowserId;
  }
};

export default function SiteAnalyticsHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const browserId = getBrowserId();
    const pageViewId = getPageViewId(pathname);

    const pulse = async () => {
      try {
        const response = await api.post(
          "/social/analytics/pulse",
          { browserId, pageViewId },
          { timeout: 8_000 },
        );
        const data = response.data?.data;
        if (
          mounted &&
          typeof data?.totalPageViews === "number" &&
          typeof data?.onlineNow === "number"
        ) {
          publishSiteMetrics({
            totalPageViews: data.totalPageViews,
            onlineNow: data.onlineNow,
          });
        }
      } catch {
        // Analytics are best-effort; feed navigation must work if the
        // metrics endpoint is unavailable or a request is rate limited.
      }
    };

    void pulse();
    const intervalId = window.setInterval(pulse, HEARTBEAT_INTERVAL_MS);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void pulse();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [pathname]);

  return null;
}
