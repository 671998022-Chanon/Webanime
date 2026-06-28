import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  Button,
  Container,
} from "@nexus/ui";

interface EmptyStatePageProps {
  /** Empty state title. @default "Nothing here yet" */
  title?: string;
  /** Empty state description. */
  description?: string;
  /** CTA label. @default "Browse Anime" */
  actionLabel?: string;
  /** CTA href. @default "/browse" */
  actionHref?: string;
}

/**
 * Full-page empty state. Centered layout with illustration, title,
 * description, and a CTA button. Used for empty watchlist, bookmarks, etc.
 */
export function EmptyStatePage({
  title = "Nothing here yet",
  description = "Start exploring to find anime you love.",
  actionLabel = "Browse Anime",
  actionHref = "/browse",
}: EmptyStatePageProps) {
  return (
    <Container size="md" className="flex min-h-[60vh] items-center justify-center py-16">
      <EmptyState layout="panel" className="items-center text-center">
        <EmptyStateTitle>{title}</EmptyStateTitle>
        <EmptyStateDescription>{description}</EmptyStateDescription>
        <EmptyStateActions>
          <Button variant="primary" asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </Container>
  );
}
