"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <FiAlertTriangle size={32} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the
        homepage.
      </p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
