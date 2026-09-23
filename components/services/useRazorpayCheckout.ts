"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  createOrder,
  verifyPayment,
} from "@/lib/api/services/services.api";
import useAuthStore from "@/stores/user/authStore";
import useServicesStore from "@/stores/services/services.store";

/**
 * Razorpay's checkout is a script-injected global rather than an npm package,
 * so it's loaded on demand and typed narrowly here — only the handful of
 * options this app actually passes.
 */
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Loads the checkout script once per page load.
 *
 * Deliberately not in the root layout: it's a third-party script on the
 * critical path of every page, and only the credits screen ever needs it. The
 * existing-tag check handles a user who visits the credits page twice in one
 * session without a reload.
 */
function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const fetchWallet = useServicesStore((state) => state.fetchWallet);
  const setBalance = useServicesStore((state) => state.setBalance);

  // A checkout that resolves after the user has navigated away must not call
  // setState on an unmounted component.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const buyCredits = useCallback(
    async (credits: number, onSuccess?: (credits: number) => void) => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const ready = await loadCheckoutScript();
        if (!ready || !window.Razorpay) {
          toast.error(
            "Couldn't load the payment window. Check your connection and try again.",
          );
          return;
        }

        const { order, razorpayKeyId } = await createOrder(credits);

        await new Promise<void>((resolve) => {
          const checkout = new window.Razorpay!({
            key: razorpayKeyId,
            amount: order.amountPaise,
            currency: order.currency,
            name: "Sharda Social",
            description: `${order.credits} credits`,
            order_id: order.razorpayOrderId,
            prefill: {
              name: user?.name ?? "",
              email: user?.email ?? "",
            },
            theme: { color: "#6366f1" },

            handler: async (response: RazorpayResponse) => {
              try {
                const result = await verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                const balance = result.data?.balance;
                if (typeof balance === "number") {
                  setBalance(balance);
                } else {
                  // The webhook may have credited it instead, in which case the
                  // verify response has no balance — read the truth back.
                  await fetchWallet();
                }

                toast.success(`${order.credits} credits added.`);
                onSuccess?.(order.credits);
              } catch {
                // The money may well have left their account — the webhook is
                // the backstop, so this is worded as a delay, not a failure.
                toast.error(
                  "We couldn't confirm that payment straight away. If it went through, your credits will appear within a few minutes.",
                );
                await fetchWallet();
              } finally {
                resolve();
              }
            },

            modal: {
              // Fires when the user closes the window without paying. Not an
              // error — just release the button.
              ondismiss: () => resolve(),
            },
          });

          checkout.on("payment.failed", () => {
            toast.error("That payment didn't go through. Please try again.");
            resolve();
          });

          checkout.open();
        });
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Couldn't start that payment. Please try again.";
        toast.error(message);
      } finally {
        if (mounted.current) setIsProcessing(false);
      }
    },
    [isProcessing, user, fetchWallet, setBalance],
  );

  return { buyCredits, isProcessing };
}
