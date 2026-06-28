// @nexus/ui — EmptyCollection composite
// Composes EmptyState for collection-specific empty views (anime lists, episodes, watchlist).
// Generic — accepts collection kind, optional title/description overrides, and action slot.
// No data fetching. Pure presentational.

import * as React from "react";

import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "./empty-state";
import { cn } from "../lib/cn";

type CollectionKind = "anime" | "episode" | "watchlist" | "search" | "generic";

const copyByKind: Record<CollectionKind, { title: string; description: string }> = {
  anime: {
    title: "No anime found",
    description:
      "There are no anime titles matching your filters. Try adjusting your search or browse trending.",
  },
  episode: {
    title: "No episodes yet",
    description: "This title has no episodes available at the moment. Check back later.",
  },
  watchlist: {
    title: "Your watchlist is empty",
    description: "Add anime to your watchlist to keep track of what you want to watch next.",
  },
  search: {
    title: "No results found",
    description: "We couldn't find anything matching your search. Try a different keyword.",
  },
  generic: {
    title: "Nothing here yet",
    description: "This collection is empty.",
  },
};

export interface EmptyCollectionProps {
  /** Collection kind — determines default copy. @default "generic" */
  kind?: CollectionKind;
  /** Override the title. Falls back to `copyByKind[kind].title`. */
  title?: string;
  /** Override the description. Falls back to `copyByKind[kind].description`. */
  description?: string;
  /** Optional action buttons (e.g. "Browse Trending"). */
  children?: React.ReactNode;
  /** Optional className for the root. */
  className?: string;
}

export function EmptyCollection({
  kind = "generic",
  title,
  description,
  children,
  className,
}: EmptyCollectionProps) {
  const copy = copyByKind[kind];
  const resolvedTitle = title ?? copy.title;
  const resolvedDescription = description ?? copy.description;

  return (
    <EmptyState data-slot="empty-collection" className={cn("py-12", className)}>
      <EmptyStateTitle>{resolvedTitle}</EmptyStateTitle>
      <EmptyStateDescription>{resolvedDescription}</EmptyStateDescription>
      {children && <EmptyStateActions>{children}</EmptyStateActions>}
    </EmptyState>
  );
}

EmptyCollection.displayName = "EmptyCollection";
