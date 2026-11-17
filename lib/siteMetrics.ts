export interface SiteMetricsSnapshot {
  totalPageViews: number;
  onlineNow: number;
}

let snapshot: SiteMetricsSnapshot | null = null;
const listeners = new Set<() => void>();

export const getSiteMetricsSnapshot = () => snapshot;

export const subscribeToSiteMetrics = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const publishSiteMetrics = (next: SiteMetricsSnapshot) => {
  snapshot = next;
  listeners.forEach((listener) => listener());
};
