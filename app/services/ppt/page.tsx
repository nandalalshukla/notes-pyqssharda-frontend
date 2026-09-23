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
  generatePpt,
  getDefaultFormat,
  getQuote,
  type Quote,
} from "@/lib/api/services/services.api";
import useAuthStore from "@/stores/user/authStore";
import useServicesStore from "@/stores/services/services.store";

/**
 * The presentation generator.
 *
 * Same shape as the report form and for the same reason: the student's own
 * slide order is the spec, and the sample deck that ships with the project only
 * supplies the editable default.
 *
 * The one thing this form pushes harder on than the report form is the sample
 * layouts strip below — students consistently underestimate how many slides
 * their content wants, and seeing what a deck is made of helps them pick a
 * slide count that isn't either eight or forty.
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
  startDate: "",
  endDate: "",
  technologies: "",

  workDescription: "",
  achievements: "",
  learnings: "",
  extraInstructions: "",
};

/** What the deck is actually built out of — shown so the count feels concrete. */
const LAYOUT_SAMPLES = [
  { name: "Title", detail: "Project, presenter, dates" },
  { name: "Agenda", detail: "Numbered sections" },
  { name: "Timeline", detail: "Week-by-week cards" },
  { name: "Section", detail: "Full-bleed divider" },
  { name: "Content", detail: "Bullets plus a fact grid" },
  { name: "Screenshot", detail: "A frame you drop an image into" },
  { name: "Stats", detail: "Big numbers with captions" },
  { name: "Takeaways", detail: "Closing lessons and thank-you" },
];

export default function PptGeneratorPage() {
  const fetchWallet = useServicesStore((state) => state.fetchWallet);
  const pricing = useServicesStore((state) => state.pricing);

  // Seeded from the account at first render rather than copied in by an
  // effect: the auth store rehydrates synchronously, so the name is already
  // there, and an effect would only add a second render for no benefit.
  const [form, setForm] = useState(() => ({
    ...INITIAL,
    studentName: useAuthStore.getState().user?.name ?? "",
  }));
  const [slides, setSlides] = useState(15);
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
    getDefaultFormat("ppt")
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

  useEffect(() => {
    if (!Number.isFinite(slides) || slides < 1) return;

    // The flag is set inside the timer, not before it: flipping state
    // synchronously in an effect body forces an extra render on every
    // keystroke, and the spinner only needs to appear once the request
    // actually starts.
    const timer = setTimeout(() => {
      setQuoteLoading(true);
      getQuote("ppt", slides)
        .then(setQuote)
        .catch(() => setQuote(null))
        .finally(() => setQuoteLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [slides]);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setSubmitting(true);

    try {
      const job = await generatePpt({ ...form, format, slides });
      setJobId(job.id);
      void fetchWallet();
      toast.success("Started. Your deck is being built.");
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
  }, [form, format, slides, fetchWallet]);

  const maxSlides = pricing?.limits.maxPptSlides ?? 40;
  const minSlides = pricing?.limits.minUnits ?? 5;

  return (
    <ServiceShell
      title="Presentation Generator"
      description="A viva-ready deck in your department's slide order, with speaker notes on every content slide."
      aside={
        jobId ? undefined : (
          <QuotePanel
            quote={quote}
            loading={quoteLoading}
            submitLabel="Generate deck"
            onSubmit={handleSubmit}
            submitting={submitting}
            note="You'll get an editable .pptx. If generation fails, your credits are returned automatically."
          />
        )
      }
    >
      {jobId ? (
        <div className="space-y-5">
          <JobProgress jobId={jobId} />
          <Button variant="outline" onClick={() => setJobId(null)}>
            Generate another deck
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <Card padding="lg" className="space-y-5">
            <FieldGroup
              title="The slide order you were given"
              description="The deck follows this exactly. The default below is the standard internship presentation structure — edit it to match what your department asked for."
            >
              <Field
                label="Slide order"
                htmlFor="format"
                error={errors.format}
                hint="One slide (or section) per line."
              >
                {formatLoading ? (
                  <div className="h-48 animate-pulse rounded-xl bg-muted" />
                ) : (
                  <Textarea
                    id="format"
                    rows={11}
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
                  getDefaultFormat("ppt")
                    .then(setFormat)
                    .finally(() => setFormatLoading(false));
                }}
              >
                Reset to the standard order
              </Button>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="How many slides"
              description="The first 15 slides are covered by the base fee; each one after that is 3 credits."
            >
              <Field
                label="Slides"
                htmlFor="slides"
                error={errors.slides}
                hint={`Between ${minSlides} and ${maxSlides}, title and thank-you slides included.`}
                className="max-w-xs"
              >
                <Input
                  id="slides"
                  type="number"
                  min={minSlides}
                  max={maxSlides}
                  value={slides}
                  error={Boolean(errors.slides)}
                  onChange={(event) => setSlides(Number(event.target.value))}
                />
              </Field>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Layouts your deck is built from
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {LAYOUT_SAMPLES.map((layout) => (
                    <div
                      key={layout.name}
                      className="rounded-xl border border-border bg-secondary/60 px-3.5 py-2.5"
                    >
                      <p className="text-sm font-bold text-foreground">
                        {layout.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {layout.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="About you"
              description="Shown on the title slide and in the footer."
            >
              <FieldRow>
                <Field label="Full name" error={errors.studentName}>
                  <Input
                    value={form.studentName}
                    error={Boolean(errors.studentName)}
                    onChange={(event) => set("studentName")(event.target.value)}
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
                  />
                </Field>
                <Field label="Semester" optional>
                  <Input
                    value={form.semester}
                    onChange={(event) => set("semester")(event.target.value)}
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
                  />
                </Field>
              </FieldRow>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup title="About the work">
              <Field
                label="Project / internship title"
                error={errors.projectTitle}
              >
                <Input
                  value={form.projectTitle}
                  error={Boolean(errors.projectTitle)}
                  onChange={(event) => set("projectTitle")(event.target.value)}
                />
              </Field>

              <FieldRow>
                <Field label="Organisation" optional>
                  <Input
                    value={form.organisation}
                    onChange={(event) => set("organisation")(event.target.value)}
                  />
                </Field>
                <Field label="Your role" optional>
                  <Input
                    value={form.role}
                    onChange={(event) => set("role")(event.target.value)}
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Mentor" optional>
                  <Input
                    value={form.mentorName}
                    onChange={(event) => set("mentorName")(event.target.value)}
                  />
                </Field>
                <Field label="Faculty guide" optional>
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

              <Field label="Technologies used" optional>
                <Input
                  value={form.technologies}
                  onChange={(event) => set("technologies")(event.target.value)}
                  placeholder="React, Node.js, MongoDB"
                />
              </Field>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="What you actually did"
              description="Every slide's content comes from here."
            >
              <div className="flex gap-3 rounded-xl bg-secondary px-4 py-3">
                <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Numbers make the best slides — how many pages you built, how
                  long a thing took, how much faster it got. If you give none,
                  no numbers are invented to fill the gap.
                </p>
              </div>

              <Field
                label="Describe the work"
                error={errors.workDescription}
                hint="What you built and how it progressed. Bullet points are fine."
              >
                <Textarea
                  rows={10}
                  value={form.workDescription}
                  error={Boolean(errors.workDescription)}
                  onChange={(event) =>
                    set("workDescription")(event.target.value)
                  }
                />
              </Field>

              <Field label="What you achieved" optional>
                <Textarea
                  rows={4}
                  value={form.achievements}
                  onChange={(event) => set("achievements")(event.target.value)}
                />
              </Field>

              <Field label="What you learned" optional>
                <Textarea
                  rows={4}
                  value={form.learnings}
                  onChange={(event) => set("learnings")(event.target.value)}
                />
              </Field>

              <Field label="Anything else the deck should follow" optional>
                <Textarea
                  rows={3}
                  value={form.extraInstructions}
                  onChange={(event) =>
                    set("extraInstructions")(event.target.value)
                  }
                  placeholder="Time limit for the presentation, slides to emphasise…"
                />
              </Field>
            </FieldGroup>
          </Card>

          <div className="lg:hidden">
            <Button
              size="lg"
              className="w-full"
              loading={submitting}
              onClick={handleSubmit}
            >
              Generate deck — {quote?.total ?? 0} credits
            </Button>
          </div>
        </div>
      )}
    </ServiceShell>
  );
}
