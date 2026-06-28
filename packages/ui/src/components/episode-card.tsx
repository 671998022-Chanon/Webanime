// @nexus/ui — EpisodeCard composite
// Composes Card + Skeleton for episode-thumbnail-style display.
// Generic — accepts episode number, title, thumbnail, duration, and watch progress.
// No data fetching. Pure presentational.

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { cn } from "../lib/cn";

import { Card } from "./card";
import { Skeleton } from "./skeleton";

export interface EpisodeCardProps {
  /** Episode number (1-based). Displayed as "Episode N". */
  episodeNumber: number;
  /** Episode title. */
  title: string;
  /** Thumbnail image src. */
  thumbnailUrl?: string;
  /** Duration string e.g. "24m", "1h 12m". */
  duration?: string;
  /** Watch progress 0–100. Hides progress bar if undefined. */
  progress?: number;
  /** Whether this episode is currently playing. */
  active?: boolean;
  /** Optional className. */
  className?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Image width. @default 320 */
  imageWidth?: number;
  /** Image height. @default 180 */
  imageHeight?: number;
  /** Show skeleton state. @default false */
  loading?: boolean;
}

export const EpisodeCard = React.forwardRef<HTMLElement, EpisodeCardProps>(function EpisodeCard(
  {
    episodeNumber,
    title,
    thumbnailUrl,
    duration,
    progress,
    active = false,
    className,
    onClick,
    imageWidth = 320,
    imageHeight = 180,
    loading = false,
  },
  ref,
) {
  if (loading) {
    return <EpisodeCardSkeleton ref={ref} className={className} />;
  }

  return (
    <Card
      ref={ref}
      data-slot="episode-card"
      variant="default"
      interactive={!!onClick}
      className={cn("group w-full max-w-[280px]", active && "ring-aether-4/60 ring-2", className)}
      onClick={onClick}
      aria-label={`Episode ${episodeNumber}: ${title}`}
      aria-current={active ? "true" : undefined}
    >
      <Card.Header className="relative aspect-video overflow-hidden rounded-t-[var(--radius-5)] p-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Episode ${episodeNumber} thumbnail`}
            width={imageWidth}
            height={imageHeight}
            className="ease-spring h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px"
            loading="lazy"
          />
        ) : (
          <Skeleton className="aspect-video w-full" />
        )}
        <div
          aria-hidden="true"
          className="ease-spring bg-void-0/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <Play className="h-10 w-10 text-white drop-shadow-lg" fill="currentColor" />
        </div>
        {duration && (
          <span
            className="bg-void-0/80 shadow-1 absolute bottom-2 right-2 rounded-[var(--radius-1)] px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
            aria-label={`Duration: ${duration}`}
          >
            {duration}
          </span>
        )}
        {progress !== undefined && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(100, Math.max(0, progress))}
            aria-label={`Watch progress: ${progress}%`}
            className="bg-void-0/40 absolute bottom-0 left-0 right-0 h-1"
          >
            <div
              className="bg-aether-4 h-full rounded-full transition-[width] duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </Card.Header>
      <Card.Body className="gap-1 p-3">
        <p className="text-text-secondary text-xs">Episode {episodeNumber}</p>
        <p className="text-text-primary line-clamp-2 text-sm font-medium leading-snug">{title}</p>
      </Card.Body>
    </Card>
  );
});

EpisodeCard.displayName = "EpisodeCard";

export interface EpisodeCardSkeletonProps {
  /** Optional className for the skeleton card. */
  className?: string;
}

export const EpisodeCardSkeleton = React.forwardRef<HTMLElement, EpisodeCardSkeletonProps>(
  function EpisodeCardSkeleton({ className }, ref) {
    return (
      <Card
        ref={ref}
        data-slot="episode-card"
        variant="default"
        className={cn("w-full max-w-[280px]", className)}
      >
        <Card.Header className="p-0">
          <Skeleton className="aspect-video w-full rounded-t-[var(--radius-5)]" />
        </Card.Header>
        <Card.Body className="gap-2 p-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
        </Card.Body>
      </Card>
    );
  },
);

EpisodeCardSkeleton.displayName = "EpisodeCardSkeleton";
