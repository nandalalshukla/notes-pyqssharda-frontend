"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiMail, FiPhone } from "react-icons/fi";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";
import { Field, FieldGroup, FieldRow, ServiceShell } from "@/components/services";
import {
  listProjectEnquiries,
  submitProjectEnquiry,
  type ProjectEnquiry,
} from "@/lib/api/services/services.api";
import useAuthStore from "@/stores/user/authStore";

/**
 * The "get a project built" enquiry form.
 *
 * This is the one service with no credits and no instant output. A project is
 * scoped and priced by a person, so the form's entire job is to collect enough
 * for someone to reply with a real quote — which is why the requirement field
 * is large, required, and asks for detail rather than a one-liner.
 *
 * The ₹500 figure is presented as a floor throughout, never as the price. The
 * final number depends on scope and is agreed before any work starts, and
 * saying so plainly here is what stops it reading as a bait price.
 */

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  projectTitle: "",
  requirement: "",
  deadline: "",
  techPreference: "",
  budgetNote: "",
};

const STATUS_LABELS: Record<ProjectEnquiry["status"], string> = {
  new: "Received",
  contacted: "We've been in touch",
  quoted: "Quote sent",
  accepted: "In progress",
  declined: "Closed",
  completed: "Delivered",
};

export default function ProjectServicePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Seeded from the account at first render — see the resume form for why this
  // isn't an effect.
  const [form, setForm] = useState(() => {
    const user = useAuthStore.getState().user;
    return {
      ...INITIAL,
      fullName: user?.name ?? "",
      email: user?.email ?? "",
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enquiries, setEnquiries] = useState<ProjectEnquiry[]>([]);

  const set = (key: keyof typeof INITIAL) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const loadEnquiries = useCallback(() => {
    if (!isAuthenticated) return;
    listProjectEnquiries()
      .then(setEnquiries)
      .catch(() => setEnquiries([]));
  }, [isAuthenticated]);

  useEffect(loadEnquiries, [loadEnquiries]);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    setSubmitting(true);

    try {
      await submitProjectEnquiry(form);
      setSubmitted(true);
      setForm((previous) => ({ ...INITIAL, ...{
        fullName: previous.fullName,
        email: previous.email,
        phone: previous.phone,
      } }));
      loadEnquiries();
      toast.success("Sent. We'll get back to you with a quote.");
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
        response?.data?.message ?? "Couldn't send that. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [form, loadEnquiries]);

  return (
    <ServiceShell
      title="Get a Project Built"
      description="Tell us what you need and we'll come back with a price and a timeline. Nothing is charged until you agree to it."
    >
      <div className="space-y-8">
        {submitted && (
          <Card className="border-success/40">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="font-semibold text-foreground">
                  Your request is with us
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;ve emailed you a copy. Someone will read through it and
                  reply on your email or phone with a quote — usually within a
                  day or two.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card padding="lg" className="bg-secondary/50">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="mint">Quoted per project</Badge>
            <p className="text-sm text-muted-foreground">
              Project work starts at{" "}
              <strong className="text-foreground">₹500</strong>. What it
              actually costs depends on scope — how much has to be built, how
              tight the deadline is, and what it has to integrate with. We
              confirm the price with you before any work begins.
            </p>
          </div>
        </Card>

        <Card padding="lg">
          <FieldGroup
            title="How we reach you"
            description="We reply here, so double-check both."
          >
            <FieldRow>
              <Field label="Full name" error={errors.fullName}>
                <Input
                  value={form.fullName}
                  error={Boolean(errors.fullName)}
                  onChange={(event) => set("fullName")(event.target.value)}
                />
              </Field>
              <Field
                label="Email"
                error={errors.email}
                hint="Doesn't have to be your university address."
              >
                <Input
                  type="email"
                  value={form.email}
                  error={Boolean(errors.email)}
                  onChange={(event) => set("email")(event.target.value)}
                  icon={<FiMail className="h-4 w-4" />}
                />
              </Field>
            </FieldRow>

            <Field
              label="Phone number"
              error={errors.phone}
              hint="For anything that's quicker to sort out on a call."
              className="sm:max-w-sm"
            >
              <Input
                value={form.phone}
                error={Boolean(errors.phone)}
                onChange={(event) => set("phone")(event.target.value)}
                placeholder="+91 90000 00000"
                icon={<FiPhone className="h-4 w-4" />}
              />
            </Field>
          </FieldGroup>
        </Card>

        <Card padding="lg">
          <FieldGroup
            title="What you need built"
            description="The more concrete this is, the more accurate the quote — and the fewer rounds of back-and-forth before we can start."
          >
            <Field label="Project title" optional>
              <Input
                value={form.projectTitle}
                onChange={(event) => set("projectTitle")(event.target.value)}
                placeholder="College event management system"
              />
            </Field>

            <Field
              label="Describe the project"
              error={errors.requirement}
              hint="What it should do, who uses it, which screens or features it needs, and anything your guide specified."
            >
              <Textarea
                rows={12}
                value={form.requirement}
                error={Boolean(errors.requirement)}
                onChange={(event) => set("requirement")(event.target.value)}
                placeholder={`What it is:
A web app for managing college events.

Who uses it:
Students register for events; a committee approves and tracks attendance.

What it needs:
- Login for students and committee members
- Event listing with dates and seat limits
- Registration with a confirmation email
- An admin view showing who registered

Other requirements:
My guide wants a database design chapter and a working demo.`}
              />
            </Field>

            <FieldRow>
              <Field
                label="Deadline"
                optional
                hint="When you need it by."
              >
                <Input
                  value={form.deadline}
                  onChange={(event) => set("deadline")(event.target.value)}
                  placeholder="End of November"
                />
              </Field>
              <Field
                label="Tech preference"
                optional
                hint="If your department requires a particular stack."
              >
                <Input
                  value={form.techPreference}
                  onChange={(event) => set("techPreference")(event.target.value)}
                  placeholder="Java + MySQL, or Python/Django"
                />
              </Field>
            </FieldRow>

            <Field
              label="Budget note"
              optional
              hint="If you have a ceiling, say so — we'll tell you honestly what fits inside it."
            >
              <Input
                value={form.budgetNote}
                onChange={(event) => set("budgetNote")(event.target.value)}
              />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              loading={submitting}
              onClick={handleSubmit}
              className="sm:w-auto"
            >
              Send my request
            </Button>
            <p className="text-xs text-muted-foreground">
              No payment now — this just starts the conversation.
            </p>
          </div>
        </Card>

        {enquiries.length > 0 && (
          <Card padding="lg">
            <h3 className="text-base font-bold text-foreground">
              Your previous requests
            </h3>
            <div className="mt-4 space-y-3">
              {enquiries.map((enquiry) => (
                <div
                  key={enquiry._id}
                  className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {enquiry.projectTitle || "Untitled project"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent{" "}
                      {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {enquiry.quotedAmountInr != null && (
                      <span className="text-sm font-bold text-foreground">
                        ₹{enquiry.quotedAmountInr}
                      </span>
                    )}
                    <Badge
                      variant={
                        enquiry.status === "completed"
                          ? "success"
                          : enquiry.status === "declined"
                            ? "default"
                            : "primary"
                      }
                    >
                      {STATUS_LABELS[enquiry.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </ServiceShell>
  );
}
