import { Button, Container } from "@nexus/ui";

interface ErrorStatePageProps {
  /** Error title. @default "Something went wrong" */
  title?: string;
  /** Error description. @default "We hit an unexpected error. Please try again." */
  description?: string;
  /** Retry handler. If provided, a "Try again" button is shown. */
  onRetry?: () => void;
}

/**
 * Full-page error state. Wraps @nexus/ui ErrorState in a Container
 * with centered layout. Used by error.tsx and global-error.tsx.
 * Can be rendered as server or client component depending on usage.
 */
export function ErrorStatePage({
  title = "Something went wrong",
  description = "We hit an unexpected error. Please try again.",
  onRetry,
}: ErrorStatePageProps) {
  return (
    <Container size="md" className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Error illustration — abstract broken crystal */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
          className="text-error/30 shrink-0"
        >
          <path
            d="M60 10L95 40L85 90L35 90L25 40Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M60 10L70 55M95 40L70 55M25 40L50 55M35 90L50 55M85 90L70 55M50 55L70 55"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="55" r="4" className="fill-error/40" stroke="none" />
        </svg>
        <h1 className="font-display text-text-primary text-2xl font-bold">{title}</h1>
        <p className="text-text-secondary max-w-md text-sm">{description}</p>
        {onRetry && (
          <Button variant="primary" onClick={onRetry} className="mt-2">
            Try again
          </Button>
        )}
      </div>
    </Container>
  );
}
