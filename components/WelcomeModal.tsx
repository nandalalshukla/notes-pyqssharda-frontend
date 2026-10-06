"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flower2, Sparkles, X } from "lucide-react";
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-mint/20 via-card to-accent-peach/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 -top-5 text-accent-mint/60"
        >
          <Flower2 size={92} strokeWidth={1.2} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-7 -left-7 rotate-12 text-accent-peach/70"
        >
          <Flower2 size={105} strokeWidth={1.1} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-24 top-12 text-accent-peach/60"
        >
          <Flower2 size={38} strokeWidth={1.2} />
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close welcome message"
          className="absolute right-4 top-4 z-10 rounded-full bg-card/70 p-2 text-muted-foreground shadow-sm transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} />
        </button>

        <div className="relative px-7 py-9 text-center sm:px-12 sm:py-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-mint text-accent-mint-foreground shadow-soft">
            <Sparkles size={30} strokeWidth={1.8} />
          </div>

          <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-primary">
            Sharda student community
          </p>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Welcome to sharda.social!
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            A social media and online library for Sharda University students.
            Sign up or sign in with your Sharda email to access all the
            features.
          </p>
          <p className="mt-5 text-lg font-black text-foreground">
            Built for the students, by the students.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              onClick={dismiss}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign up with Sharda email
            </Link>
            <Link
              href="/auth/login"
              onClick={dismiss}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
