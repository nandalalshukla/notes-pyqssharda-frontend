"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiLock, FiZap } from "react-icons/fi";
import { Button, Card, Skeleton } from "@/components/ui";
import useAuthStore from "@/stores/user/authStore";
import useServicesStore from "@/stores/services/services.store";

/**
 * The chrome every services page sits inside: a title block, a live credit
 * balance, and the sign-in gate.
 *
 * The gate is the important part. Every generated document carries a student's
 * real name and system ID and is charged to a wallet, so none of these screens
 * make sense — or are safe — without an account. The backend enforces this
 * independently; this is only so the user meets a sign-in prompt rather than a
 * 401 after filling in a twenty-field form.
 */
export function ServiceShell({
  title,
  description,
  backHref = "/services",
  backLabel = "All services",
  children,
  aside,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const fetchWallet = useServicesStore((state) => state.fetchWallet);
  const fetchPricing = useServicesStore((state) => state.fetchPricing);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchWallet();
    void fetchPricing();
  }, [isAuthenticated, fetchWallet, fetchPricing]);

  // Auth state rehydrates from storage on first paint; rendering the sign-in
  // wall before that resolves would flash it at users who are already signed in.
  if (!authInitialized) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-96" />
        <Skeleton className="mt-8 h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInWall title={title} description={description} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <FiArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        <CreditChip />
      </header>

      <div
        className={
          aside
            ? "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
            : "mt-8"
        }
      >
        <div className="min-w-0">{children}</div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </div>
  );
}

/** The balance pill, linking to the top-up screen. */
export function CreditChip() {
  const wallet = useServicesStore((state) => state.wallet);
  const loading = useServicesStore((state) => state.walletLoading);

  return (
    <Link
      href="/services/credits"
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-soft-sm transition-all hover:shadow-soft-md"
    >
      <FiZap className="h-4 w-4 text-primary" />
      {loading && !wallet ? (
        <span className="inline-block h-4 w-10 animate-pulse rounded bg-muted" />
      ) : (
        <span>{wallet?.balance ?? 0}</span>
      )}
      <span className="font-semibold text-muted-foreground">credits</span>
    </Link>
  );
}

function SignInWall({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <Card padding="lg" className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FiLock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-foreground sm:text-2xl">
          Sign in to use {title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description
            ? `${description} You'll need an account — your documents are saved to it, and credits are charged from your wallet.`
            : "You'll need an account — your documents are saved to it, and credits are charged from your wallet."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() =>
              // Sent along so the login screen can return the user to the page
              // they were actually trying to use.
              router.push(`/auth/login?next=${encodeURIComponent(pathname)}`)
            }
          >
            Log in
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/auth/register")}
          >
            Create an account
          </Button>
        </div>
      </Card>
    </div>
  );
}
