"use client";

import { ErrorStatePage } from "@/components/state/error-state";

/**
 * Route-level error boundary. Catches errors thrown by Server Components
 * and client components within this route segment. Must be a client component
 * per Next.js convention. Receives error + reset function.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // AppShell already renders the <main id="main-content"> wrapper, so the
  // boundary must not nest a second one — duplicate ids break the SkipLink
  // target and violate WCAG. ErrorStatePage is the direct child.
  return (
    <ErrorStatePage
      title="Something went wrong"
      description={
        error.message
          ? `We encountered an error: ${error.message}`
          : "We hit an unexpected error. Please try again."
      }
      onRetry={reset}
    />
  );
}
