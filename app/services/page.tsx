"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiCode,
  FiFileText,
  FiLayers,
  FiZap,
} from "react-icons/fi";
import { Badge, Card } from "@/components/ui";
import { CreditChip } from "@/components/services";
import useAuthStore from "@/stores/user/authStore";
import useServicesStore from "@/stores/services/services.store";
import { cn } from "@/lib/utils/cn";

/**
 * The services landing page.
 *
 * Prices are shown here as plain rupees rather than credits. Someone landing
 * on this page has no idea what a credit is yet, and "₹50" answers the
 * question they actually have; the credit system is explained once they reach
 * a form or the top-up screen.
 */
const SERVICES = [
  {
    href: "/services/resume",
    label: "Resume Builder",
    icon: FiFileText,
    accent: "coral" as const,
    price: "₹25",
    priceNote: "flat",
    tagline: "A recruiter-ready resume, written toward the role you're chasing",
    points: [
      "You fill in your education, skills and projects",
      "Achievement-first bullets, no filler",
      "Downloads as an editable Word file",
    ],
  },
  {
    href: "/services/report",
    label: "Project Report Generator",
    icon: FiLayers,
    accent: "purple" as const,
    price: "from ₹50",
    priceNote: "15 pages, then ₹3/page",
    tagline:
      "A full internship or project report, built in your department's format",
    points: [
      "You paste the format your guide gave you",
      "Front matter, chapters, tables and appendices",
      "Downloads as an editable .docx",
    ],
  },
  {
    href: "/services/ppt",
    label: "Presentation Generator",
    icon: FiZap,
    accent: "sky" as const,
    price: "from ₹50",
    priceNote: "15 slides, then ₹3/slide",
    tagline: "A viva-ready deck with speaker notes on every slide",
    points: [
      "You give the slide order you were told to follow",
      "Varied layouts — timelines, stats, screenshots",
      "Downloads as an editable .pptx",
    ],
  },
  {
    href: "/services/project",
    label: "Get a Project Built",
    icon: FiCode,
    accent: "mint" as const,
    price: "from ₹500",
    priceNote: "quoted per project",
    tagline: "Tell us what you need built and we'll come back with a quote",
    points: [
      "Describe the project in your own words",
      "We reply on your email or phone",
      "Nothing is charged until you agree the price",
    ],
  },
];

const ACCENT_CLASSES = {
  coral: "bg-accent-coral/15 text-accent-coral-foreground dark:text-accent-coral",
  purple:
    "bg-accent-purple/15 text-accent-purple-foreground dark:text-accent-purple",
  sky: "bg-accent-sky/15 text-accent-sky-foreground dark:text-accent-sky",
  mint: "bg-accent-mint/15 text-accent-mint-foreground dark:text-accent-mint",
};

export default function ServicesPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchWallet = useServicesStore((state) => state.fetchWallet);

  useEffect(() => {
    if (isAuthenticated) void fetchWallet();
  }, [isAuthenticated, fetchWallet]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="primary" className="mb-3">
            Student services
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            The paperwork, handled
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Reports, decks and resumes built in <em>your</em> department&apos;s
            format — you give the format and the facts, we do the writing and
            the layout. Pay only for what you generate.
          </p>
        </div>
        {isAuthenticated && <CreditChip />}
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = service.icon;

          return (
            <Link key={service.href} href={service.href} className="group">
              <Card
                hoverable
                padding="lg"
                className="flex h-full flex-col transition-transform duration-200 group-hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      ACCENT_CLASSES[service.accent],
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-foreground">
                      {service.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.priceNote}
                    </p>
                  </div>
                </div>

                <h2 className="mt-5 text-lg font-bold text-foreground">
                  {service.label}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {service.tagline}
                </p>

                <ul className="mt-4 space-y-2">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Start
                  <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      <section className="mt-12 grid gap-5 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <h3 className="text-base font-bold text-foreground">
            How the pricing works
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Everything is priced in credits, and{" "}
            <strong className="text-foreground">1 credit is ₹1</strong> — no
            conversion to work out. A report or presentation costs 50 credits
            for the first 15 pages or slides, then 3 credits for each one after
            that. A resume is a flat 25. If a generation fails, the credits go
            straight back to your wallet.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/services/credits"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              Buy credits <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/services/documents"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              My documents <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        <Card>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FiBriefcase className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-base font-bold text-foreground">
            Written from your facts
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nothing is invented. Names, dates, marks and outcomes come only from
            what you type in — anywhere a fact is missing, you get a marked
            placeholder to fill rather than a made-up detail you&apos;d have to
            defend in a viva.
          </p>
        </Card>
      </section>
    </div>
  );
}
