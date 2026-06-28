// @nexus/ui — AnimeCard composite
// Composes Card + Badge + Skeleton for anime-poster-style display.
// Generic — accepts title, cover image URL, score, and watchlist state.
// No data fetching. Pure presentational.

import { Plus, Check } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "../lib/cn";

import { Badge, type BadgeProps } from "./badge";
import { Card, CardHeader, CardBody, CardFooter } from "./card";
import { Skeleton } from "./skeleton";

type BadgeVariant = BadgeProps["variant"];

export interface AnimeCardProps {
  /** Anime title — used for image alt and aria-label. */
  title: string;
  /** Cover image src. Use next/image for optimization. */
  coverUrl?: string;
  /** Rating score 0–10. Hides badge if undefined. */
  score?: number;
  /** Number of episodes. Hides if undefined. */
  episodeCount?: number;
  /** Whether the title is in the user's watchlist. */
  inWatchlist?: boolean;
  /** Optional badge variant override. @default "default" */
  badgeVariant?: BadgeVariant;
  /** Optional className for the root card. */
  className?: string;
  /** Click handler for the card body (navigate to detail). */
  onClick?: () => void;
  /** Watchlist toggle handler. */
  onWatchlistToggle?: () => void;
  /** Image width. @default 300 */
  imageWidth?: number;
  /** Image height. @default 420 */
  imageHeight?: number;
  /** Whether to show the skeleton state. @default false */
  loading?: boolean;
}

function scoreBadgeVariant(score: number): BadgeVariant {
  if (score >= 8) return "success";
  if (score >= 6) return "warning";
  return "error";
}

export function AnimeCard({
  title,
  coverUrl,
  score,
  episodeCount,
  inWatchlist = false,
  badgeVariant,
  className,
  onClick,
  onWatchlistToggle,
  imageWidth = 300,
  imageHeight = 420,
  loading = false,
}: AnimeCardProps) {
  if (loading) {
    return <AnimeCardSkeleton className={className} />;
  }

  const computedBadge =
    badgeVariant ?? (score !== undefined ? scoreBadgeVariant(score) : undefined);

  return (
    <Card
      data-slot="anime-card"
      variant="default"
      interactive={!!onClick}
      className={cn("group w-full max-w-[220px]", className)}
      onClick={onClick}
      aria-label={title}
    >
      <CardHeader className="relative overflow-hidden rounded-t-[var(--radius-5)] p-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            width={imageWidth}
            height={imageHeight}
            className="ease-spring h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 220px"
            loading="lazy"
          />
        ) : (
          <Skeleton className="w-full" style={{ aspectRatio: `${imageWidth}/${imageHeight}` }} />
        )}
        {computedBadge && score !== undefined && (
          <Badge
            variant={computedBadge}
            className="shadow-1 absolute right-2 top-2"
            aria-label={`Score: ${score} out of 10`}
          >
            {score.toFixed(1)}
          </Badge>
        )}
      </CardHeader>
      <CardBody className="gap-1 p-3">
        <p className="text-text-primary line-clamp-2 text-sm font-medium leading-snug">{title}</p>
        {episodeCount !== undefined && (
          <p className="text-text-secondary text-xs">{episodeCount} episodes</p>
        )}
      </CardBody>
      {onWatchlistToggle && (
        <CardFooter className="p-3 pt-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistToggle();
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--radius-3)] px-3 py-1.5",
              "ease-spring text-xs font-medium transition-colors duration-200",
              "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
              inWatchlist
                ? "bg-aether-4/20 text-aether-7"
                : "bg-surface-raised text-text-secondary hover:bg-surface-overlay hover:text-text-primary",
            )}
            aria-pressed={inWatchlist}
            aria-label={
              inWatchlist ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`
            }
          >
            {inWatchlist ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {inWatchlist ? "In Watchlist" : "Watchlist"}
          </button>
        </CardFooter>
      )}
    </Card>
  );
}

AnimeCard.displayName = "AnimeCard";

export function AnimeCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      data-slot="anime-card"
      variant="default"
      className={cn("w-full max-w-[220px]", className)}
    >
      <CardHeader className="p-0">
        <Skeleton className="aspect-[3/4] w-full rounded-t-[var(--radius-5)]" />
      </CardHeader>
      <CardBody className="gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardBody>
    </Card>
  );
}

AnimeCardSkeleton.displayName = "AnimeCardSkeleton";
