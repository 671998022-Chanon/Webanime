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
  return (
    <main id="main-content" className="flex-1">
      <ErrorStatePage
        title="Something went wrong"
        description={
          error.message
            ? `We encountered an error: ${error.message}`
            : "We hit an unexpected error. Please try again."
        }
        onRetry={reset}
      />
    </main>
  );
}
