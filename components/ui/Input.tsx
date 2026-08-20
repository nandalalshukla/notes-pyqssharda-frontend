import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const fieldBase =
  "w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, endAdornment, ...props }, ref) => {
    if (icon || endAdornment) {
      return (
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              fieldBase,
              error ? "border-destructive" : "border-input",
              icon && "pl-10",
              endAdornment && "pr-10",
              className,
            )}
            {...props}
          />
          {endAdornment && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endAdornment}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          fieldBase,
          error ? "border-destructive" : "border-input",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
