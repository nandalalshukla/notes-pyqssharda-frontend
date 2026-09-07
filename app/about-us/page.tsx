"use client";

import React from "react";
import {
  FaUserSecret,
  FaUserShield,
  FaLinkedin,
  FaGithub,
  FaInstagram,
} from "react-icons/fa";
import { MdEmail, MdLibraryBooks, MdRocketLaunch } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/structuredData";
import { HOME_FAQS } from "@/lib/seo/faqs";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-foreground">
      {/* Decorative Background Elements similar to Home */}
      <div className="pointer-events-none fixed top-20 left-20 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
      <div className="pointer-events-none fixed right-20 bottom-20 h-40 w-40 rounded-full bg-accent-purple/20 blur-3xl"></div>

      <div className="mx-auto max-w-6xl px-6 pt-12 md:pt-20">
        {/* --- HERO SECTION --- */}
        <div className="mb-20 animate-fade-in-up text-center">
          <div className="mb-6 inline-block rounded-full bg-accent-coral px-6 py-2 text-sm font-bold tracking-wide text-accent-coral-foreground uppercase shadow-soft-sm">
            About The Platform
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-black tracking-tight md:text-6xl">
            Built For Students, <br className="hidden md:block" />
            <span className="text-primary">By the Students.</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed font-medium text-muted-foreground md:text-xl">
            Bridging the gap between exam panic and preparation with organized
            resources at your fingertips.
          </p>
        </div>

        {/* --- OUR STORY SECTION (Clean & Professional) --- */}
        <div className="mb-24 grid animate-fade-in-up gap-8 md:grid-cols-2">
          {/* Left: The Problem */}
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-8 shadow-soft-md md:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <MdRocketLaunch className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-black md:text-3xl">
              The Origin Story
            </h2>
            <p className="mb-4 leading-7 text-muted-foreground">
              It started with a familiar situation: the night before an exam.
              The syllabus was buried in chat logs, notes were scattered across
              groups, and previous year questions (PYQs) were nowhere to be
              found.
            </p>
            <p className="leading-7 text-muted-foreground">
              The realization hit hard—the problem wasn&apos;t the exam itself, but
              the <strong className="text-foreground">Disorganized Resources</strong>. We realized that
              students needed a single, reliable source of truth to focus on
              what matters: studying.
            </p>
          </div>

          {/* Right: The Solution */}
          <div className="flex flex-col justify-center rounded-2xl bg-primary p-8 text-primary-foreground shadow-soft-md md:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
              <MdLibraryBooks className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-2xl font-black md:text-3xl">
              The Solution
            </h2>
            <p className="mb-4 leading-7 opacity-90">
              <strong>Sharda Online Library</strong> was born to solve this
              chaos. We created a centralized platform where you can access:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-accent-mint"></span>
                <span className="font-medium">Comprehensive Syllabus</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-accent-coral"></span>
                <span className="font-medium">Organized Lecture Notes</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-accent-purple"></span>
                <span className="font-medium">Verified PYQs repository</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- OFFICIAL STATEMENT --- */}
        <div className="mb-24">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-soft-md md:p-10">
            <h2 className="mb-4 text-2xl font-black md:text-3xl">
              Official Statement
            </h2>
            <p className="mb-4 leading-7 text-muted-foreground">
              This platform is a student-led initiative created to support
              students by organizing academic resources in one place. It is not
              an official initiative of Sharda University, nor does it represent
              the University in any capacity.
            </p>
            <p className="leading-7 text-muted-foreground">
              All resources available on this platform are copyrighted and are
              the property of Sharda University. The materials are shared solely
              for educational reference in accordance with applicable policies
              and guidelines.
            </p>
          </div>
        </div>

        {/* --- MEET THE TEAM SECTION --- */}
        <div className="mb-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-black md:text-4xl">
              Meet The Team
            </h2>
            <div className="mx-auto h-1.5 w-20 rounded-full bg-ink"></div>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Admin Card */}
            <div className="lift-on-hover flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft-md hover:shadow-soft-lg">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-purple shadow-soft-sm">
                <FaUserSecret className="h-10 w-10 text-accent-purple-foreground" />
              </div>
              <h3 className="mb-2 text-2xl font-black">Admin Team</h3>
              <p className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                Platform Developers
              </p>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                Dedicated to building and maintaining the infrastructure that
                keeps this library running 24/7.
              </p>
              <a
                href="mailto:admin@shardaonlinelibrary.com"
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:bg-primary-hover"
              >
                <BiSupport className="h-5 w-5" />
                Contact Admin Team
              </a>
            </div>

            {/* Mods Card */}
            <div className="lift-on-hover flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft-md hover:shadow-soft-lg">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-coral shadow-soft-sm">
                <FaUserShield className="h-10 w-10 text-accent-coral-foreground" />
              </div>
              <h3 className="mb-2 text-2xl font-black">Mod Team</h3>
              <p className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                Content Guardians
              </p>
              <p className="mb-8 leading-relaxed text-muted-foreground">
                Ensuring that every note, syllabus, and PYQ is verified,
                organized, and relevant for you.
              </p>
              <a
                href="mailto:mods@shardaonlinelibrary.com"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-bold text-foreground transition-colors hover:bg-secondary"
              >
                <MdEmail className="h-5 w-5" />
                Contact Mod Team
              </a>
            </div>
          </div>
        </div>

        {/* --- FOOTER / SOCIALS --- */}
        <div className="mx-auto max-w-2xl border-t-2 border-border pt-12 pb-8 text-center">
          <p className="mb-6 font-bold text-muted-foreground">
            Stay connected with our journey
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="rounded-full border border-border bg-card p-3 shadow-soft-sm transition-transform hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-full border border-border bg-card p-3 shadow-soft-sm transition-transform hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-full border border-border bg-card p-3 shadow-soft-sm transition-transform hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <FaGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* FAQ.
          Moved here from the homepage, which is now feed-first. The
          FAQPage structured data travels with the visible copy on purpose:
          Google requires the marked-up answer to be on the page a reader
          actually sees, so the schema can't stay behind on a page that no
          longer shows it. */}
      <JsonLd data={faqSchema(HOME_FAQS)} />

      <section
        aria-labelledby="faq-heading"
        className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8"
      >
        <h2
          id="faq-heading"
          className="mb-8 text-center text-3xl font-black text-foreground md:text-4xl"
        >
          Frequently asked questions
        </h2>

        <dl className="space-y-4">
          {HOME_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm"
            >
              <dt className="mb-2 text-lg font-black text-foreground">
                {faq.question}
              </dt>
              <dd className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
