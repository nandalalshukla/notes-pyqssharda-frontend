import React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "pop";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft-sm hover:shadow-soft-md",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-secondary",
  ghost: "bg-transparent text-foreground hover:bg-secondary",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90 shadow-soft-sm",
  pop: "bg-primary text-primary-foreground shadow-soft-md hover:shadow-soft-lg lift-on-hover active:translate-y-0 active:shadow-soft-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          icon && iconPosition === "left" && (
            <span className="shrink-0" aria-hidden="true">
              {icon}
            </span>
          )
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
