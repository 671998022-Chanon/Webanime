import { LoadingSkeleton } from "@/components/state/loading-skeleton";

/**
 * Global loading state — rendered by Next.js while page segments stream.
 * Delegates to the shared `LoadingSkeleton` so the loading layout stays
 * in sync with the home page content shape. Wrapped in `<main id="main-content">`
 * so the SkipLink target exists even during loading.
 */
export default function Loading() {
  return (
    <main id="main-content" className="flex-1">
      <LoadingSkeleton />
    </main>
  );
}
