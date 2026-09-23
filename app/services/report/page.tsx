"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiInfo, FiRefreshCw } from "react-icons/fi";
import { Button, Card, Input, Textarea } from "@/components/ui";
import {
  Field,
  FieldGroup,
  FieldRow,
  JobProgress,
  QuotePanel,
  ServiceShell,
} from "@/components/services";
import {
  generateReport,
  getDefaultFormat,
  getQuote,
  type Quote,
} from "@/lib/api/services/services.api";
import useAuthStore from "@/stores/user/authStore";
import useServicesStore from "@/stores/services/services.store";

/**
 * The report generator form.
 *
 * Two things drive its shape:
 *
 * - **The format field is the centrepiece, not an afterthought.** Departments
 *   and guides hand out different chapter lists, and a report in the wrong
 *   structure gets sent back regardless of how well it's written. It is
 *   pre-filled from the sample format the project ships with, so a student
 *   with no specific instructions isn't staring at a blank box — but it is
 *   editable, and whatever ends up in it is what the document is built from.
 *
 * - **The narrative field is long and asked for insistently.** Everything
 *   factual in the report comes from it. A one-line answer produces a thin,
 *   generic document, so the hint and the minimum length both push toward
 *   detail before any credits are spent.
 */

const INITIAL = {
  studentName: "",
  systemId: "",
  course: "",
  branch: "",
  section: "",
  semester: "",
  university: "Sharda University",
  department: "",

  projectTitle: "",
  organisation: "",
  mentorName: "",
  guideName: "",
  role: "",
  mode: "",
  startDate: "",
  endDate: "",
  technologies: "",

  workDescription: "",
  achievements: "",
  challenges: "",
  learnings: "",
  extraInstructions: "",
};

export default function ReportGeneratorPage() {
  const fetchWallet = useServicesStore((state) => state.fetchWallet);
  const pricing = useServicesStore((state) => state.pricing);

  // Seeded from the account at first render rather than copied in by an
  // effect: the auth store rehydrates synchronously, so the name is already
  // there, and an effect would only add a second render for no benefit.
  const [form, setForm] = useState(() => ({
    ...INITIAL,
    studentName: useAuthStore.getState().user?.name ?? "",
  }));
  const [pages, setPages] = useState(20);
  const [format, setFormat] = useState("");
  const [formatLoading, setFormatLoading] = useState(true);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof INITIAL) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    getDefaultFormat("report")
      .then((text) => {
        if (!cancelled) setFormat(text);
      })
      .finally(() => {
        if (!cancelled) setFormatLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-quote whenever the page count settles. Debounced because this fires on
  // every keystroke in a number field, and a quote is a round trip.
  useEffect(() => {
    if (!Number.isFinite(pages) || pages < 1) return;

    // The flag is set inside the timer, not before it: flipping state
    // synchronously in an effect body forces an extra render on every
    // keystroke, and the spinner only needs to appear once the request
    // actually starts.
    const timer = setTimeout(() => {
      setQuoteLoading(true);
      getQuote("report", pages)
        .then(setQuote)
        .catch(() => setQuote(null))
        .finally(() => setQuoteLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [pages]);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setSubmitting(true);

    try {
      const job = await generateReport({ ...form, format, pages });
      setJobId(job.id);
      // Credits have just been spent — refresh so the chip and the quote panel
      // don't keep showing the pre-charge balance.
      void fetchWallet();
      toast.success("Started. Your report is being written.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const response = (
        error as {
          response?: {
            data?: { message?: string; errors?: Record<string, string> };
          };
        }
      ).response;

      if (response?.data?.errors) setErrors(response.data.errors);
      toast.error(
        response?.data?.message ?? "Couldn't start that. Please check the form.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [form, format, pages, fetchWallet]);

  const maxPages = pricing?.limits.maxReportPages ?? 60;
  const minPages = pricing?.limits.minUnits ?? 5;

  return (
    <ServiceShell
      title="Project Report Generator"
      description="A full internship or project report, written from your own account of the work and laid out in the format your department gave you."
      aside={
        jobId ? undefined : (
          <QuotePanel
            quote={quote}
            loading={quoteLoading}
            submitLabel="Generate report"
            onSubmit={handleSubmit}
            submitting={submitting}
            note="You'll get an editable .docx. If generation fails, your credits are returned automatically."
          />
        )
      }
    >
      {jobId ? (
        <div className="space-y-5">
          <JobProgress jobId={jobId} />
          <Button variant="outline" onClick={() => setJobId(null)}>
            Generate another report
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <Card padding="lg" className="space-y-5">
            <FieldGroup
              title="The format you were given"
              description="This is what the report is built from. Paste your guide's or department's section list here — the default below is the standard Sharda internship structure."
            >
              <Field
                label="Report format"
                htmlFor="format"
                error={errors.format}
                hint="One section per line. Add, remove or rename anything — the report follows this exactly."
              >
                {formatLoading ? (
                  <div className="h-56 animate-pulse rounded-xl bg-muted" />
                ) : (
                  <Textarea
                    id="format"
                    rows={12}
                    value={format}
                    error={Boolean(errors.format)}
                    onChange={(event) => setFormat(event.target.value)}
                    className="font-mono text-xs leading-relaxed"
                  />
                )}
              </Field>

              <Button
                variant="ghost"
                size="sm"
                icon={<FiRefreshCw />}
                onClick={() => {
                  setFormatLoading(true);
                  getDefaultFormat("report")
                    .then(setFormat)
                    .finally(() => setFormatLoading(false));
                }}
              >
                Reset to the standard format
              </Button>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="How long it should be"
              description="Priced by length — the first 15 pages are covered by the base fee, and each page after that is 3 credits."
            >
              <Field
                label="Pages"
                htmlFor="pages"
                error={errors.pages}
                hint={`Between ${minPages} and ${maxPages} pages, front matter included.`}
                className="max-w-xs"
              >
                <Input
                  id="pages"
                  type="number"
                  min={minPages}
                  max={maxPages}
                  value={pages}
                  error={Boolean(errors.pages)}
                  onChange={(event) => setPages(Number(event.target.value))}
                />
              </Field>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="About you"
              description="Printed on the title page and the declaration."
            >
              <FieldRow>
                <Field label="Full name" error={errors.studentName}>
                  <Input
                    value={form.studentName}
                    error={Boolean(errors.studentName)}
                    onChange={(event) => set("studentName")(event.target.value)}
                    placeholder="As it should appear on the report"
                  />
                </Field>
                <Field label="System ID" error={errors.systemId}>
                  <Input
                    value={form.systemId}
                    error={Boolean(errors.systemId)}
                    onChange={(event) => set("systemId")(event.target.value)}
                    placeholder="2024905364"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Course / programme" error={errors.course}>
                  <Input
                    value={form.course}
                    error={Boolean(errors.course)}
                    onChange={(event) => set("course")(event.target.value)}
                    placeholder="B.Tech / BCA / MBA"
                  />
                </Field>
                <Field label="Branch" error={errors.branch}>
                  <Input
                    value={form.branch}
                    error={Boolean(errors.branch)}
                    onChange={(event) => set("branch")(event.target.value)}
                    placeholder="Computer Science and Engineering"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Section" optional>
                  <Input
                    value={form.section}
                    onChange={(event) => set("section")(event.target.value)}
                    placeholder="A"
                  />
                </Field>
                <Field label="Semester" optional>
                  <Input
                    value={form.semester}
                    onChange={(event) => set("semester")(event.target.value)}
                    placeholder="6th"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="University" optional>
                  <Input
                    value={form.university}
                    onChange={(event) => set("university")(event.target.value)}
                  />
                </Field>
                <Field label="Department" optional>
                  <Input
                    value={form.department}
                    onChange={(event) => set("department")(event.target.value)}
                    placeholder="Department of Computer Applications"
                  />
                </Field>
              </FieldRow>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="About the work"
              description="The internship or project this report is about."
            >
              <Field label="Project / internship title" error={errors.projectTitle}>
                <Input
                  value={form.projectTitle}
                  error={Boolean(errors.projectTitle)}
                  onChange={(event) => set("projectTitle")(event.target.value)}
                  placeholder="Web Development Internship — LMS Platform"
                />
              </Field>

              <FieldRow>
                <Field label="Organisation" optional>
                  <Input
                    value={form.organisation}
                    onChange={(event) => set("organisation")(event.target.value)}
                    placeholder="Where you did the work"
                  />
                </Field>
                <Field label="Your role" optional>
                  <Input
                    value={form.role}
                    onChange={(event) => set("role")(event.target.value)}
                    placeholder="Full Stack Developer Intern"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Mentor at the organisation" optional>
                  <Input
                    value={form.mentorName}
                    onChange={(event) => set("mentorName")(event.target.value)}
                  />
                </Field>
                <Field
                  label="Faculty guide"
                  optional
                  hint="The person the report is submitted to."
                >
                  <Input
                    value={form.guideName}
                    onChange={(event) => set("guideName")(event.target.value)}
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Start date" optional>
                  <Input
                    value={form.startDate}
                    onChange={(event) => set("startDate")(event.target.value)}
                    placeholder="25 May 2026"
                  />
                </Field>
                <Field label="End date" optional>
                  <Input
                    value={form.endDate}
                    onChange={(event) => set("endDate")(event.target.value)}
                    placeholder="6 July 2026"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Mode" optional>
                  <Input
                    value={form.mode}
                    onChange={(event) => set("mode")(event.target.value)}
                    placeholder="On-site / Work from home / Hybrid"
                  />
                </Field>
                <Field label="Technologies used" optional>
                  <Input
                    value={form.technologies}
                    onChange={(event) => set("technologies")(event.target.value)}
                    placeholder="React, Node.js, MongoDB"
                  />
                </Field>
              </FieldRow>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="What you actually did"
              description="This is the substance of the report — everything factual in it comes from here."
            >
              <div className="flex gap-3 rounded-xl bg-secondary px-4 py-3">
                <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Write it however it comes out — bullet points, a week-by-week
                  list, or a few paragraphs. Detail is what separates a report
                  that reads as yours from one that reads as filler, and nothing
                  is invented to cover a gap.
                </p>
              </div>

              <Field
                label="Describe the work"
                error={errors.workDescription}
                hint="What you built, what you were responsible for, how it progressed week to week."
              >
                <Textarea
                  rows={10}
                  value={form.workDescription}
                  error={Boolean(errors.workDescription)}
                  onChange={(event) =>
                    set("workDescription")(event.target.value)
                  }
                  placeholder="Week 1: joined the team, set up the repo and read through the existing codebase…"
                />
              </Field>

              <Field label="What you achieved" optional>
                <Textarea
                  rows={4}
                  value={form.achievements}
                  onChange={(event) => set("achievements")(event.target.value)}
                  placeholder="Shipped the enrolment form; cut page load from 4s to 1.2s…"
                />
              </Field>

              <Field label="Problems you ran into" optional>
                <Textarea
                  rows={4}
                  value={form.challenges}
                  onChange={(event) => set("challenges")(event.target.value)}
                  placeholder="Build failures on deploy, DNS propagation delays…"
                />
              </Field>

              <Field label="What you learned" optional>
                <Textarea
                  rows={4}
                  value={form.learnings}
                  onChange={(event) => set("learnings")(event.target.value)}
                />
              </Field>

              <Field
                label="Anything else the report should follow"
                optional
                hint="Word count rules, a tone your guide asked for, sections to emphasise."
              >
                <Textarea
                  rows={3}
                  value={form.extraInstructions}
                  onChange={(event) =>
                    set("extraInstructions")(event.target.value)
                  }
                />
              </Field>
            </FieldGroup>
          </Card>

          {/* The quote panel is sticky on desktop but off-screen on mobile, so
              the primary action is repeated at the end of the form. */}
          <div className="lg:hidden">
            <Button
              size="lg"
              className="w-full"
              loading={submitting}
              onClick={handleSubmit}
            >
              Generate report — {quote?.total ?? 0} credits
            </Button>
          </div>
        </div>
      )}
    </ServiceShell>
  );
}
