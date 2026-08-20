"use client";

import { useEffect } from "react";

/**
 * Catches a crash in the ROOT layout itself (providers, fonts, etc.) —
 * app/error.tsx only catches crashes in page content rendered *inside* a
 * working layout, so without this file a root-layout-level crash showed
 * the browser's blank default error screen with zero recovery UI.
 *
 * Next.js requires this file to render its own <html>/<body> — it replaces
 * the root layout entirely when active, so it deliberately doesn't import
 * this app's design-system components/providers (ThemeProvider, Toaster,
 * etc.) or globals.css tokens: if the root layout is what crashed, those
 * are exactly the things that might not be safe to rely on. Plain
 * inline-styled HTML only.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#faf9fd",
          color: "#15131f",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h1>
        <p
          style={{
            marginTop: "0.5rem",
            maxWidth: "26rem",
            color: "#6b6478",
            fontSize: "0.9rem",
          }}
        >
          The app hit an unexpected error loading this page. Try again, or
          reload the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "0.75rem",
            border: "none",
            background: "#6366f1",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
