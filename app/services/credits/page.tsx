"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCreditCard,
  FiZap,
} from "react-icons/fi";
import { Badge, Button, Card, EmptyState, Input, Skeleton } from "@/components/ui";
import { ServiceShell, useRazorpayCheckout } from "@/components/services";
import {
  getTransactions,
  type CreditTransaction,
} from "@/lib/api/services/services.api";
import useServicesStore from "@/stores/services/services.store";
import { cn } from "@/lib/utils/cn";

/**
 * Buy credits, and see where they went.
 *
 * The statement matters as much as the packs: a wallet people can't audit is a
 * wallet people don't trust. Every purchase, spend and automatic refund shows
 * up here with the balance it left behind.
 */
const REASON_LABELS: Record<CreditTransaction["reason"], string> = {
  purchase: "Credits purchased",
  generation: "Document generated",
  refund: "Refunded",
  promo: "Bonus credits",
  admin_adjustment: "Adjustment",
};

export default function CreditsPage() {
  const wallet = useServicesStore((state) => state.wallet);
  const pricing = useServicesStore((state) => state.pricing);
  const walletLoading = useServicesStore((state) => state.walletLoading);
  const { buyCredits, isProcessing } = useRazorpayCheckout();

  const [custom, setCustom] = useState("");
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  // `txLoading` starts true, so the initial fetch never has to switch it on —
  // which keeps this out of the effect body. A refresh after a purchase simply
  // swaps the rows in without flashing a skeleton over a list that's already
  // on screen.
  const loadTransactions = useCallback(() => {
    getTransactions(1, 25)
      .then((result) => setTransactions(result.transactions))
      .catch(() => setTransactions([]))
      .finally(() => setTxLoading(false));
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleBuy = (credits: number) =>
    void buyCredits(credits, () => {
      // The purchase itself is now on the statement.
      loadTransactions();
      setCustom("");
    });

  const customCredits = Number(custom);
  const customValid =
    Number.isFinite(customCredits) &&
    Number.isInteger(customCredits) &&
    customCredits >= (pricing?.limits.minPurchaseCredits ?? 25) &&
    customCredits <= (pricing?.limits.maxPurchaseCredits ?? 5000);

  return (
    <ServiceShell
      title="Credits"
      description="Everything on Services is priced in credits, and one credit is ₹1. Top up here — credits never expire."
    >
      <div className="space-y-8">
        <Card padding="lg" className="bg-primary/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your balance
              </p>
              {walletLoading && !wallet ? (
                <Skeleton className="mt-2 h-10 w-32" />
              ) : (
                <p className="mt-1 text-4xl font-extrabold text-foreground">
                  {wallet?.balance ?? 0}
                  <span className="ml-2 text-base font-semibold text-muted-foreground">
                    credits
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Bought</p>
                <p className="font-bold text-foreground">
                  {wallet?.lifetimePurchased ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Spent</p>
                <p className="font-bold text-foreground">
                  {wallet?.lifetimeSpent ?? 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {pricing && !pricing.paymentsEnabled && (
          <Card className="border-warning/40">
            <p className="text-sm text-muted-foreground">
              Card payments are temporarily unavailable. Please check back
              shortly — nothing you already have has been affected.
            </p>
          </Card>
        )}

        <section>
          <h2 className="text-base font-bold text-foreground">Top up</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(pricing?.packs ?? []).map((pack) => (
              <Card
                key={pack.id}
                hoverable
                className={cn(
                  "relative flex flex-col",
                  pack.popular && "border-primary ring-1 ring-primary",
                )}
              >
                {pack.popular && (
                  <Badge
                    variant="primary"
                    className="absolute -top-2.5 left-4"
                  >
                    Most popular
                  </Badge>
                )}
                <p className="text-sm font-semibold text-muted-foreground">
                  {pack.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold text-foreground">
                  {pack.credits}
                </p>
                <p className="text-xs text-muted-foreground">credits</p>
                <p className="mt-3 text-lg font-bold text-foreground">
                  ₹{pack.credits}
                </p>
                <Button
                  className="mt-4 w-full"
                  variant={pack.popular ? "primary" : "outline"}
                  loading={isProcessing}
                  disabled={pricing ? !pricing.paymentsEnabled : false}
                  onClick={() => handleBuy(pack.credits)}
                  icon={<FiCreditCard />}
                >
                  Buy
                </Button>
              </Card>
            ))}

            {!pricing &&
              [0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-56 w-full rounded-2xl" />
              ))}
          </div>

          <Card className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="custom-credits"
                  className="text-sm font-semibold text-foreground"
                >
                  Or choose your own amount
                </label>
                <Input
                  id="custom-credits"
                  type="number"
                  className="mt-1.5"
                  value={custom}
                  min={pricing?.limits.minPurchaseCredits ?? 25}
                  max={pricing?.limits.maxPurchaseCredits ?? 5000}
                  onChange={(event) => setCustom(event.target.value)}
                  placeholder={`${pricing?.limits.minPurchaseCredits ?? 25}–${pricing?.limits.maxPurchaseCredits ?? 5000} credits`}
                />
              </div>
              <Button
                loading={isProcessing}
                disabled={
                  !customValid || (pricing ? !pricing.paymentsEnabled : false)
                }
                onClick={() => handleBuy(customCredits)}
                icon={<FiZap />}
              >
                {customValid ? `Pay ₹${customCredits}` : "Enter an amount"}
              </Button>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground">Statement</h2>

          {txLoading ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<FiZap className="h-6 w-6" />}
              title="Nothing here yet"
              description="Your purchases, spends and refunds will show up here as soon as you use a service."
            />
          ) : (
            <Card padding="none" className="mt-4 divide-y divide-border">
              {transactions.map((transaction) => {
                const isCredit = transaction.direction === "credit";

                return (
                  <div
                    key={transaction._id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        isCredit
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCredit ? (
                        <FiArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <FiArrowUpRight className="h-4 w-4" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {transaction.description ||
                          REASON_LABELS[transaction.reason]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          isCredit ? "text-success" : "text-foreground",
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.balanceAfter} left
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>
    </ServiceShell>
  );
}
