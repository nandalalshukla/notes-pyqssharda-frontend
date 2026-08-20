import React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "coral"
  | "mint"
  | "purple"
  | "sky"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  coral: "bg-accent-coral/20 text-accent-coral-foreground dark:text-accent-coral",
  mint: "bg-accent-mint/20 text-accent-mint-foreground dark:text-accent-mint",
  purple: "bg-accent-purple/20 text-accent-purple-foreground dark:text-accent-purple",
  sky: "bg-accent-sky/20 text-accent-sky-foreground dark:text-accent-sky",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  outline: "border border-border text-foreground",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
