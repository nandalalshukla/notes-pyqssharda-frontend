"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiDownload,
  FiFileText,
  FiLayers,
  FiLoader,
  FiZap,
} from "react-icons/fi";
import { Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { ServiceShell } from "@/components/services";
import {
  getDownloadUrl,
  listJobs,
  type GenerationJob,
  type ServiceKind,
} from "@/lib/api/services/services.api";

/**
 * Everything the user has generated.
 *
 * Documents stay downloadable indefinitely — the outline is kept server-side,
 * so even if the stored file has been cleaned up the download route rebuilds
 * it. That's deliberate: someone who paid for a report a month before their
 * viva should not lose it because of our storage policy.
 */
const SERVICE_META: Record<
  ServiceKind,
  { label: string; icon: typeof FiFileText; unit: string }
> = {
  report: { label: "Report", icon: FiLayers, unit: "pages" },
  ppt: { label: "Presentation", icon: FiZap, unit: "slides" },
  resume: { label: "Resume", icon: FiFileText, unit: "" },
};

const STATUS_VARIANT = {
  completed: "success",
  queued: "primary",
  generating: "primary",
  failed: "destructive",
  refunded: "warning",
} as const;

const STATUS_LABEL = {
  completed: "Ready",
  queued: "Queued",
  generating: "Writing…",
  failed: "Failed",
  refunded: "Refunded",
} as const;

export default function DocumentsPage() {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(() => {
    listJobs({ limit: 50 })
      .then((result) => setJobs(result.jobs))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  // Refresh while anything is still running, so a document that finishes in
  // another tab (or after the user navigated here mid-generation) turns into a
  // download button on its own.
  useEffect(() => {
    const hasRunning = jobs.some(
      (job) => job.status === "queued" || job.status === "generating",
    );
    if (!hasRunning) return;

    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [jobs, load]);

  const handleDownload = async (jobId: string) => {
    setDownloadingId(jobId);
    try {
      const { url } = await getDownloadUrl(jobId);
      // assign() rather than `location.href = url`: the signed URL is served
      // with an attachment disposition, so this starts the download instead of
      // navigating away from the list.
      window.location.assign(url);
    } catch {
      toast.error("Couldn't fetch that download link. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ServiceShell
      title="My Documents"
      description="Every report, deck and resume you've generated. Downloads stay available."
    >
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<FiFileText className="h-6 w-6" />}
          title="You haven't generated anything yet"
          description="Build a resume, write up a report, or put a presentation together — they'll all land here."
          action={
            <Link href="/services">
              <Button>Browse services</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const meta = SERVICE_META[job.service];
            const Icon = meta.icon;
            const isRunning =
              job.status === "queued" || job.status === "generating";

            return (
              <Card key={job._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {isRunning ? (
                        <FiLoader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">
                        {job.title || `Untitled ${meta.label.toLowerCase()}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {meta.label}
                        {meta.unit && ` · ${job.units} ${meta.unit}`} ·{" "}
                        {job.creditsCharged} credits ·{" "}
                        {new Date(job.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {job.status === "refunded" && job.errorMessage && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {job.errorMessage} — credits returned.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant={STATUS_VARIANT[job.status]}>
                      {STATUS_LABEL[job.status]}
                    </Badge>
                    {job.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<FiDownload />}
                        loading={downloadingId === job._id}
                        onClick={() => handleDownload(job._id)}
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ServiceShell>
  );
}
