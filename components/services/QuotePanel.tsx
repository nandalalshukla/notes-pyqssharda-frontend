"use client";

import Link from "next/link";
import { FiZap } from "react-icons/fi";
import { Button, Card } from "@/components/ui";
import type { Quote } from "@/lib/api/services/services.api";
import useServicesStore from "@/stores/services/services.store";
import { cn } from "@/lib/utils/cn";

/**
 * The price panel that sits beside every generator form.
 *
 * It shows the quote broken down rather than as a single number, because the
 * pricing has a shape people should be able to check: a base bundle covers the
 * first N pages, and extras are charged per page. A bare "65 credits" invites
 * "why?"; the breakdown answers it before it's asked.
 *
 * Every figure comes from the server's quote — nothing is recomputed here.
 */
export function QuotePanel({
  quote,
  loading,
  submitLabel,
  onSubmit,
  submitting,
  disabled,
  note,
}: {
  quote: Quote | null;
  loading?: boolean;
  submitLabel: string;
  onSubmit: () => void;
  submitting?: boolean;
  disabled?: boolean;
  note?: string;
}) {
  const wallet = useServicesStore((state) => state.wallet);
  const balance = wallet?.balance ?? 0;
  const total = quote?.total ?? 0;

  const shortfall = Math.max(0, total - balance);
  const canAfford = shortfall === 0;

  return (
    <Card className="sticky top-24 space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          What this costs
        </p>

        <div className="mt-3 space-y-2">
          {loading || !quote ? (
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          ) : (
            quote.lines.map((line) => (
              <div
                key={line.label}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{line.label}</span>
                <span className="font-semibold text-foreground">
                  {line.credits}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm font-bold text-foreground">Total</span>
          <span className="text-xl font-extrabold text-foreground">
            {total}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              credits
            </span>
          </span>
        </div>

        {/* 1 credit = ₹1, so this is the same number — but seeing it in rupees
            is what makes the credit system legible at a glance. */}
        <p className="mt-1 text-right text-xs text-muted-foreground">
          ₹{total}
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl px-3.5 py-3 text-sm",
          canAfford
            ? "bg-secondary text-secondary-foreground"
            : "bg-warning/10 text-foreground",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Your balance</span>
          <span className="font-bold">{balance} credits</span>
        </div>

        {!canAfford && total > 0 && (
          <p className="mt-2 text-xs font-medium">
            You need {shortfall} more.{" "}
            <Link
              href="/services/credits"
              className="font-bold text-primary hover:underline"
            >
              Top up
            </Link>
          </p>
        )}
      </div>

      <Button
        onClick={onSubmit}
        loading={submitting}
        disabled={disabled || !canAfford || total === 0}
        icon={<FiZap />}
        className="w-full"
        size="lg"
      >
        {canAfford ? submitLabel : `Need ${shortfall} more credits`}
      </Button>

      {note && (
        <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      )}
    </Card>
  );
}
