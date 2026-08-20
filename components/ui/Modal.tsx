"use client";

import React from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
  padding?: "none" | "default";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  hideCloseButton = false,
  padding = "default",
}: ModalProps) {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={cn(
                "w-full rounded-2xl border border-border bg-card shadow-soft-lg max-h-[90vh] flex flex-col",
                sizeClasses[size],
              )}
            >
              {(title || !hideCloseButton) && (
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                  <div>
                    {title && (
                      <DialogTitle className="text-lg font-bold text-foreground">
                        {title}
                      </DialogTitle>
                    )}
                    {description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  {!hideCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              )}

              <div className={cn("overflow-y-auto", padding === "default" && "px-6 py-5")}>
                {children}
              </div>

              {footer && (
                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                  {footer}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
