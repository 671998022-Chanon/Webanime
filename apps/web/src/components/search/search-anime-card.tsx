"use client";

import { Badge, CommandItem, Skeleton, cn } from "@nexus/ui";
import { Star } from "lucide-react";
import * as React from "react";

/** Anime type badge values. */
export type AnimeType = "TV" | "Movie" | "OVA" | "ONA" | "Special";

export interface SearchAnimeCardProps extends Omit<
  React.ComponentPropsWithoutRef<typeof CommandItem>,
  "value"
> {
  /** Anime title. */
  title: string;
  /** Anime type (TV / Movie / OVA / ...). */
  type: AnimeType;
  /** Number of episodes. Omits the episode line when undefined. */
  episodeCount?: number;
  /** Rating score 0–10. Omits the rating when undefined. */
  score?: number;
  /** Shows a skeleton placeholder instead of content (loading state). @default false */
  loading?: boolean;
}

/**
 * Compact anime result card for the CmdK search palette.
 * Presentational only — no data fetching. Renders a poster placeholder,
 * title, type chip, episode count, and a star rating.
 */
export const SearchAnimeCard = React.forwardRef<
  React.ComponentRef<typeof CommandItem>,
  SearchAnimeCardProps
>(({ title, type, episodeCount, score, className, loading = false, ...props }, ref) => {
  return (
    <CommandItem
      ref={ref}
      value={title}
      aria-label={
        loading
          ? "Loading"
          : `${title}, ${type}${episodeCount !== undefined ? `, ${episodeCount} episodes` : ""}${score !== undefined ? `, rated ${score.toFixed(1)}` : ""}`
      }
      className={cn("items-start gap-3 py-2", className)}
      {...props}
    >
      {/* Poster placeholder */}
      {loading ? (
        <Skeleton className="aspect-[3/4] w-10 shrink-0 rounded-[var(--radius-2)]" />
      ) : (
        <div
          className="bg-surface-raised aspect-[3/4] w-10 shrink-0 rounded-[var(--radius-2)]"
          aria-hidden="true"
        />
      )}

      {/* Text column */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {loading ? (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </>
        ) : (
          <>
            <span className="text-text-primary truncate text-sm font-medium leading-snug">
              {title}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">
                {type}
              </Badge>
              {episodeCount !== undefined && (
                <span className="text-text-secondary text-xs">{episodeCount} episodes</span>
              )}
              {score !== undefined && (
                <span className="inline-flex items-center gap-0.5 text-xs text-[var(--nexus-nova-4)]">
                  <Star className="size-3" aria-hidden="true" />
                  {score.toFixed(1)}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </CommandItem>
  );
});

SearchAnimeCard.displayName = "SearchAnimeCard";
