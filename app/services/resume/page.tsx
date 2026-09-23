"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiInfo } from "react-icons/fi";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import {
  Field,
  FieldGroup,
  FieldRow,
  JobProgress,
  QuotePanel,
  ServiceShell,
} from "@/components/services";
import {
  generateResume,
  getQuote,
  type Quote,
} from "@/lib/api/services/services.api";
import useAuthStore from "@/stores/user/authStore";
import useServicesStore from "@/stores/services/services.store";

/**
 * The resume builder.
 *
 * Unlike the report and deck generators there's no format field — a resume has
 * no departmental template to follow, and the thing that actually decides its
 * shape is the role being applied for. So `targetRole` is required and sits at
 * the top: section order and which details get surfaced are chosen against it.
 *
 * The hints throughout push for specifics (numbers, stacks, outcomes) because
 * a resume written from vague input is a resume full of the filler phrases
 * recruiters skim past.
 */

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",

  targetRole: "",
  headline: "",

  education: "",
  skills: "",
  experience: "",
  projects: "",
  certifications: "",
  achievements: "",
  extras: "",
  extraInstructions: "",
};

export default function ResumeBuilderPage() {
  const fetchWallet = useServicesStore((state) => state.fetchWallet);

  // Name and email are already on the account, so they're seeded at first
  // render — that removes two fields from a form that's long enough already,
  // without the extra render an effect would cost.
  const [form, setForm] = useState(() => {
    const user = useAuthStore.getState().user;
    return {
      ...INITIAL,
      fullName: user?.name ?? "",
      email: user?.email ?? "",
    };
  });
  const [length, setLength] = useState<"one_page" | "two_page">("one_page");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof INITIAL) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  // A resume is flat-priced, so this is fetched once rather than re-quoted.
  useEffect(() => {
    getQuote("resume")
      .then(setQuote)
      .catch(() => setQuote(null));
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setSubmitting(true);

    try {
      const job = await generateResume({ ...form, length });
      setJobId(job.id);
      void fetchWallet();
      toast.success("Started. Your resume is being written.");
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
  }, [form, length, fetchWallet]);

  return (
    <ServiceShell
      title="Resume Builder"
      description="A one-page resume written toward the role you're applying for — achievement-first bullets, no filler, and nothing invented."
      aside={
        jobId ? undefined : (
          <QuotePanel
            quote={quote}
            submitLabel="Build my resume"
            onSubmit={handleSubmit}
            submitting={submitting}
            note="Flat fee — you can download the finished resume as many times as you like. Regenerating with changes costs another 25."
          />
        )
      }
    >
      {jobId ? (
        <div className="space-y-5">
          <JobProgress jobId={jobId} />
          <Button variant="outline" onClick={() => setJobId(null)}>
            Build another resume
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <Card padding="lg">
            <FieldGroup
              title="What you're applying for"
              description="The whole resume is ordered and worded against this — it's the most important field on the page."
            >
              <Field
                label="Target role"
                error={errors.targetRole}
                hint="Be specific. 'Backend Developer Intern — Node.js' beats 'Software job'."
              >
                <Input
                  value={form.targetRole}
                  error={Boolean(errors.targetRole)}
                  onChange={(event) => set("targetRole")(event.target.value)}
                  placeholder="Backend Developer Intern"
                />
              </Field>

              <FieldRow>
                <Field
                  label="Headline"
                  optional
                  hint="The line under your name. Left blank, one is written for you."
                >
                  <Input
                    value={form.headline}
                    onChange={(event) => set("headline")(event.target.value)}
                    placeholder="Full Stack Developer — B.Tech CSE"
                  />
                </Field>
                <Field label="Length">
                  <Select
                    value={length}
                    onChange={(event) =>
                      setLength(event.target.value as "one_page" | "two_page")
                    }
                  >
                    <option value="one_page">One page (recommended)</option>
                    <option value="two_page">Two pages</option>
                  </Select>
                </Field>
              </FieldRow>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="Contact details"
              description="Printed in one line under your name."
            >
              <FieldRow>
                <Field label="Full name" error={errors.fullName}>
                  <Input
                    value={form.fullName}
                    error={Boolean(errors.fullName)}
                    onChange={(event) => set("fullName")(event.target.value)}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    error={Boolean(errors.email)}
                    onChange={(event) => set("email")(event.target.value)}
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Phone" optional>
                  <Input
                    value={form.phone}
                    onChange={(event) => set("phone")(event.target.value)}
                    placeholder="+91 90000 00000"
                  />
                </Field>
                <Field label="City" optional>
                  <Input
                    value={form.location}
                    onChange={(event) => set("location")(event.target.value)}
                    placeholder="Greater Noida"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="LinkedIn" optional>
                  <Input
                    value={form.linkedin}
                    onChange={(event) => set("linkedin")(event.target.value)}
                    placeholder="linkedin.com/in/you"
                  />
                </Field>
                <Field label="GitHub" optional>
                  <Input
                    value={form.github}
                    onChange={(event) => set("github")(event.target.value)}
                    placeholder="github.com/you"
                  />
                </Field>
              </FieldRow>

              <Field label="Portfolio" optional>
                <Input
                  value={form.portfolio}
                  onChange={(event) => set("portfolio")(event.target.value)}
                  placeholder="yoursite.com"
                />
              </Field>
            </FieldGroup>
          </Card>

          <Card padding="lg">
            <FieldGroup
              title="What goes on it"
              description="Type it however it comes out — it gets rewritten into resume lines."
            >
              <div className="flex gap-3 rounded-xl bg-secondary px-4 py-3">
                <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Give numbers wherever you have them — users, endpoints, marks,
                  percentages, team size. Where you don&apos;t, the scope gets
                  described instead; no metric is ever made up for you, because
                  you&apos;d have to defend it in the interview.
                </p>
              </div>

              <Field
                label="Education"
                error={errors.education}
                hint="Degree, institution, years, CGPA or percentage. Add school if you want it on there."
              >
                <Textarea
                  rows={4}
                  value={form.education}
                  error={Boolean(errors.education)}
                  onChange={(event) => set("education")(event.target.value)}
                  placeholder="B.Tech Computer Science, Sharda University, 2022–2026, CGPA 8.4"
                />
              </Field>

              <Field
                label="Skills"
                error={errors.skills}
                hint="Languages, frameworks, tools, databases — a plain list is fine."
              >
                <Textarea
                  rows={3}
                  value={form.skills}
                  error={Boolean(errors.skills)}
                  onChange={(event) => set("skills")(event.target.value)}
                  placeholder="JavaScript, TypeScript, React, Node.js, Express, MongoDB, Git, Docker"
                />
              </Field>

              <Field
                label="Experience / internships"
                optional
                hint="Role, organisation, dates, and what you actually did there."
              >
                <Textarea
                  rows={6}
                  value={form.experience}
                  onChange={(event) => set("experience")(event.target.value)}
                  placeholder="Full Stack Intern at PASS The Excellence, May–July 2026. Built the marketing site…"
                />
              </Field>

              <Field
                label="Projects"
                optional
                hint="What it does, what you built it with, and anything measurable about it."
              >
                <Textarea
                  rows={6}
                  value={form.projects}
                  onChange={(event) => set("projects")(event.target.value)}
                  placeholder="Sharda Social — a notes and PYQ library for the university. Next.js, Express, MongoDB…"
                />
              </Field>

              <FieldRow>
                <Field label="Certifications" optional>
                  <Textarea
                    rows={3}
                    value={form.certifications}
                    onChange={(event) =>
                      set("certifications")(event.target.value)
                    }
                  />
                </Field>
                <Field label="Achievements" optional>
                  <Textarea
                    rows={3}
                    value={form.achievements}
                    onChange={(event) => set("achievements")(event.target.value)}
                    placeholder="Hackathon placings, scholarships, positions of responsibility"
                  />
                </Field>
              </FieldRow>

              <Field
                label="Anything else"
                optional
                hint="Languages spoken, volunteering, publications."
              >
                <Textarea
                  rows={3}
                  value={form.extras}
                  onChange={(event) => set("extras")(event.target.value)}
                />
              </Field>

              <Field label="Instructions for the writer" optional>
                <Textarea
                  rows={3}
                  value={form.extraInstructions}
                  onChange={(event) =>
                    set("extraInstructions")(event.target.value)
                  }
                  placeholder="Lead with projects, keep the summary short, leave out school details…"
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
              Build my resume — {quote?.total ?? 25} credits
            </Button>
          </div>
        </div>
      )}
    </ServiceShell>
  );
}
