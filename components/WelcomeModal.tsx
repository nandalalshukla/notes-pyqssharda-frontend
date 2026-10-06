"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Modal } from "@/components/ui";

const WELCOME_MODAL_STORAGE_KEY = "sharda-social-welcome-seen";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(WELCOME_MODAL_STORAGE_KEY) !== "true") {
        queueMicrotask(() => setIsOpen(true));
      }
    } catch {
      // If storage is unavailable, the modal still works for this visit.
      queueMicrotask(() => setIsOpen(true));
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, "true");
    } catch {
      // Dismissing the modal should still work when storage is unavailable.
    }
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      size="lg"
      hideCloseButton
      padding="none"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#fffaf2] dark:bg-card">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close welcome message"
          className="absolute right-4 top-4 z-10 rounded-full bg-card/70 p-2 text-muted-foreground shadow-sm transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 px-7 pb-36 pt-12 text-center sm:px-12 sm:pb-40 sm:pt-14">
          <h2 className="font-[family-name:var(--font-brand-serif)] text-4xl font-bold tracking-tight text-[#2a211f] dark:text-foreground sm:text-5xl">
            Welcome to sharda.social!
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#665b58] dark:text-muted-foreground sm:text-lg">
            A social media and online library for Sharda University students.
            Sign up or sign in with your Sharda email to access all the
            features.
          </p>
          <p className="mt-5 font-[family-name:var(--font-brand-serif)] text-xl font-bold text-[#2a211f] dark:text-foreground">
            Built for the students, by the students.
          </p>

          <div className="relative z-10 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              onClick={dismiss}
              className="welcome-shimmer inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign up with Sharda email
            </Link>
            <Link
              href="/auth/login"
              onClick={dismiss}
              className="welcome-shimmer inline-flex h-10 items-center justify-center rounded-xl border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 640 116"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-24 w-full"
        >
          <path d="M0 113C120 103 210 112 320 108s210-9 320 3v5H0Z" fill="#d8f0d2" />
          <g stroke="#32734b" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M66 113V58M226 113V45M390 113V60M548 113V42" />
            <path d="M66 87C47 75 35 78 22 91M66 76c17-17 29-20 43-14M226 87c-19-15-34-13-49-2M226 73c17-17 30-18 45-10M390 91c-16-14-27-14-42-5M390 79c15-15 29-17 44-9M548 80c-18-15-31-14-47-4M548 68c17-16 30-17 44-8" />
          </g>
          <g stroke="#3d2c27" strokeWidth="2">
            <g transform="translate(66 45)">
              <circle r="15" fill="#f7b529" />
              <circle r="6" fill="#75401f" />
              <path d="M0-15V-25M0 15v10M15 0h10M-15 0h-10M11-11l8-8M-11 11l-8 8M11 11l8 8M-11-11l-8-8" stroke="#f7b529" strokeWidth="7" strokeLinecap="round" />
            </g>
            <g transform="translate(226 32)">
              <circle r="13" fill="#f26a4f" />
              <circle r="5" fill="#ffd36a" />
              <path d="M0-13V-23M0 13v10M13 0h10M-13 0h-10M9-9l7-7M-9 9l-7 7M9 9l7 7M-9-9l-7-7" stroke="#f26a4f" strokeWidth="6" strokeLinecap="round" />
            </g>
            <g transform="translate(390 48)">
              <circle r="14" fill="#f4a7a0" />
              <circle r="5" fill="#e9a92d" />
              <path d="M0-14V-23M0 14v10M14 0h10M-14 0h-10M10-10l8-8M-10 10l-8 8M10 10l8 8M-10-10l-8-8" stroke="#f4a7a0" strokeWidth="6" strokeLinecap="round" />
            </g>
            <g transform="translate(548 29)">
              <circle r="14" fill="#f6b72b" />
              <circle r="5" fill="#70401e" />
              <path d="M0-14V-23M0 14v10M14 0h10M-14 0h-10M10-10l8-8M-10 10l-8 8M10 10l8 8M-10-10l-8-8" stroke="#f6b72b" strokeWidth="6" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>
    </Modal>
  );
}
