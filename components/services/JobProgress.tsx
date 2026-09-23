"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiLoader,
} from "react-icons/fi";
import { Button, Card } from "@/components/ui";
import {
  getDownloadUrl,
  getJob,
  type GenerationJob,
} from "@/lib/api/services/services.api";
import useServicesStore from "@/stores/services/services.store";

/**
 * Watches a running generation and offers the download when it lands.
 *
 * Generation is asynchronous on the server — a 40-page report takes minutes,
 * far past any request timeout — so the job is polled rather than awaited. Two
 * details matter:
 *
 * - **Polling stops at a terminal status.** Left running, a failed job would
 *   hammer the API for as long as the tab stayed open.
 * - **A ceiling on attempts.** If something goes wrong badly enough that the
 *   job never reaches a terminal state, the UI says so and stops, instead of
 *   spinning forever and leaving the user with no idea what happened.
 */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 200; // ~10 minutes, comfortably past the longest report.

const TERMINAL: GenerationJob["status"][] = [
  "completed",
  "failed",
  "refunded",
];

export function JobProgress({
  jobId,
  onDone,
}: {
  jobId: string;
  onDone?: (job: GenerationJob) => void;
}) {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fetchWallet = useServicesStore((state) => state.fetchWallet);

  // Held in a ref so a new inline callback from the parent doesn't tear down
  // and restart the poll on every render. Written in an effect rather than
  // during render, which React forbids.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (cancelled) return;

      try {
        const next = await getJob(jobId);
        if (cancelled) return;

        setJob(next);

        if (TERMINAL.includes(next.status)) {
          onDoneRef.current?.(next);
          // A refund puts credits back, so the balance shown elsewhere is now
          // stale.
          if (next.status === "refunded") void fetchWallet();
          return;
        }
      } catch {
        // A single failed poll is usually a blip; only the attempt ceiling
        // ends the loop.
      }

      attempts += 1;
      if (attempts >= MAX_POLLS) {
        if (!cancelled) setGaveUp(true);
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, fetchWallet]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { url } = await getDownloadUrl(jobId);
      // The signed URL is served with an attachment disposition, so this starts
      // the download rather than replacing the page.
      window.location.assign(url);
    } catch {
      toast.error("Couldn't fetch that download link. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (gaveUp) {
    return (
      <Card className="border-warning/40">
        <div className="flex items-start gap-3">
          <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-foreground">
              This is taking longer than expected
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your document is still being built. Check{" "}
              <Link
                href="/services/documents"
                className="font-semibold text-primary hover:underline"
              >
                My Documents
              </Link>{" "}
              in a few minutes — and if it failed, your credits are returned
              automatically.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!job || job.status === "queued" || job.status === "generating") {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <FiLoader className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {job?.status === "generating"
                ? "Writing your document…"
                : "Getting started…"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This usually takes a minute or two. You can leave this page — it
              will be waiting in My Documents.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (job.status === "completed") {
    return (
      <Card className="border-success/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="font-semibold text-foreground">
                {job.title || "Your document"} is ready
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.output?.fileName ??
                  `${job.units} ${job.service === "ppt" ? "slides" : "pages"}`}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            loading={downloading}
            icon={<FiDownload />}
          >
            Download
          </Button>
        </div>
      </Card>
    );
  }

  // failed / refunded
  return (
    <Card className="border-destructive/40">
      <div className="flex items-start gap-3">
        <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-foreground">
            That document couldn&apos;t be generated
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.errorMessage ??
              "Something went wrong while building your document."}{" "}
            Your {job.creditsCharged} credits have been returned to your wallet.
          </p>
        </div>
      </div>
    </Card>
  );
}
