// ProgressCard — Task 14.3
// Reusable card for the Continue Watching rail. Shows a poster with a play
// overlay on hover, the anime title, current-episode badge, a watch-progress
// bar, remaining-time + last-watched meta, and a "Resume" button.
//
// Marked "use client": this card composes Radix-based primitives that rely on
// refs (Card/AspectRatio via forwardRef, Progress via Radix). Next.js requires
// a client boundary for components that render ref-backed primitives, even when
// the component itself holds no state. All data still comes via props, so the
// production data layer can drive it unchanged.

"use client";

import { AspectRatio, Badge, Button, Card, Progress, Typography } from "@nexus/ui";
import { Play } from "lucide-react";

import type { ContinueWatchingEntry } from "./mock-continue-watching-data";

export interface ProgressCardProps {
  /** A single continue-watching entry. */
  entry: ContinueWatchingEntry;
}

/** Episode badge label — "Ep 8 / 13" when total is known, else "Ep 8". */
function episodeLabel(current: number, total: number | null): string {
  return total === null ? `Ep ${current}` : `Ep ${current} / ${total}`;
}

/** Episode badge variant derived from airing status. */
function episodeBadgeVariant(
  status: ContinueWatchingEntry["status"],
): "info" | "success" | "default" {
  switch (status) {
    case "airing":
      return "info";
    case "completed":
      return "success";
    case "upcoming":
      return "default";
  }
}

export function ProgressCard({ entry }: ProgressCardProps) {
  const {
    title,
    posterImage,
    currentEpisode,
    totalEpisodes,
    progressPct,
    remainingTime,
    watchedAt,
  } = entry;

  const resumeLabel = `Resume ${title} at episode ${currentEpisode}`;

  return (
    <Card
      interactive
      variant="glass"
      className="group min-w-0"
      aria-label={`${title}, episode ${currentEpisode} of ${totalEpisodes ?? "unknown"}, ${progressPct}% watched`}
    >
      {/* ── Poster with play overlay ── */}
      {/* AspectRatio keeps a stable 2:3 poster box so the card never shifts
          when the image loads (CLS budget, Home.md §R3). The play icon fades
          in on hover/focus per Home.md §11 "Progress card hover: play icon
          overlay fade-in 150ms". */}
      <AspectRatio ratio={2 / 3} className="relative overflow-hidden">
        <div
          role="presentation"
          aria-hidden="true"
          className="ease-spring absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
          style={{ backgroundImage: `url(${posterImage})` }}
        />

        {/* Fallback gradient if the poster fails to load. */}
        <div role="presentation" aria-hidden="true" className="bg-gradient-hero absolute inset-0" />

        {/* Bottom scrim keeps the episode badge readable over the poster. */}
        <div
          role="presentation"
          aria-hidden="true"
          className="from-void-1 absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent"
        />

        {/* Play overlay — hidden from AT (the Resume button is the control);
            purely visual affordance. Fades in on hover/focus. */}
        <div
          aria-hidden="true"
          className="bg-void-1/40 ease-spring absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
        >
          <div className="bg-surface-overlay/90 text-text-primary shadow-1 flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm">
            <Play className="size-5" fill="currentColor" />
          </div>
        </div>

        {/* Episode badge — pinned bottom-left over the poster. */}
        <Badge
          variant={episodeBadgeVariant(entry.status)}
          size="sm"
          className="shadow-1 absolute bottom-2 left-2"
        >
          {episodeLabel(currentEpisode, totalEpisodes)}
        </Badge>
      </AspectRatio>

      {/* ── Body: title + progress + meta + resume ── */}
      <Card.Body className="gap-2.5">
        <Typography
          element="h3"
          size="sm"
          weight="semibold"
          className="text-text-primary line-clamp-1"
        >
          {title}
        </Typography>

        {/* Watch progress bar. Progress is a client primitive (Radix) that
            exposes role="progressbar" + aria-valuenow for screen readers. */}
        <Progress value={progressPct} size="sm" aria-label={`Watch progress: ${progressPct}%`} />

        {/* Meta row: remaining time + last watched. */}
        <Typography element="p" size="xs" className="text-text-tertiary line-clamp-1">
          {remainingTime}
          <span aria-hidden="true" className="text-void-7">
            {" · "}
          </span>
          {watchedAt}
        </Typography>

        {/* Resume button — primary action. Full-width on mobile for easy
            thumb reach; auto-width on larger screens. */}
        <Button
          variant="primary"
          size="sm"
          className="mt-1 w-full sm:w-auto"
          aria-label={resumeLabel}
        >
          <Play className="size-3.5" aria-hidden="true" />
          Resume
        </Button>
      </Card.Body>
    </Card>
  );
}
