// Hero slide content — Task 14.2
// Presentational component rendering a single featured anime inside a
// glassmorphism content panel. Receives all data via props — no data fetching.
// Does NOT own slide state; composed inside HeroBanner.

import { Badge, Button, LinkButton, Typography } from "@nexus/ui";
import { Play, Info } from "lucide-react";

import type { HeroSlideData } from "./mock-hero-data";

export interface HeroSlideProps {
  /** The featured anime data for this slide. */
  slide: HeroSlideData;
}

/** Status badge variant derived from the slide's airing status. */
function statusBadgeVariant(status: HeroSlideData["status"]): "success" | "default" | "info" {
  switch (status) {
    case "airing":
      return "success";
    case "completed":
      return "default";
    case "upcoming":
      return "info";
  }
}

/** Human-readable status label. */
function statusLabel(status: HeroSlideData["status"]): string {
  switch (status) {
    case "airing":
      return "Airing";
    case "completed":
      return "Completed";
    case "upcoming":
      return "Upcoming";
  }
}

export function HeroSlide({ slide }: HeroSlideProps) {
  return (
    <div className="flex h-full flex-col justify-end p-6 md:p-8 lg:p-10">
      {/* Glassmorphism content panel — Standard Glass (reversed) per
          Glassmorphism.md §Glass by Component: "Hero overlay: Standard (reversed)".
          Background uses aether tint for featured content (Tinted Glass variant). */}
      <div
        className="border-aether-5/20 bg-void-2/70 shadow-1 max-w-2xl space-y-4 rounded-[var(--radius-5)] border p-5 backdrop-blur-sm md:p-6 lg:p-8"
        data-slot="hero-content-panel"
      >
        {/* Eyebrow row: status badge + season */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(slide.status)} size="sm">
            {statusLabel(slide.status)}
          </Badge>
          <Typography element="span" size="sm" className="text-text-tertiary">
            {slide.season}
          </Typography>
        </div>

        {/* Title — id matches aria-labelledby in HeroBanner root section */}
        <Typography
          element="h2"
          id="hero-slide-heading"
          size="3xl"
          weight="bold"
          className="text-text-primary leading-tight md:text-4xl lg:text-5xl"
        >
          {slide.title}
        </Typography>

        {/* Subtitle / Description */}
        <Typography element="p" size="md" className="text-text-secondary line-clamp-2">
          {slide.subtitle}
        </Typography>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Genres">
          {slide.genres.map((genre) => (
            <Badge key={genre} variant="info" size="sm" role="listitem">
              {genre}
            </Badge>
          ))}
        </div>

        {/* Meta row: rating + episode count + season number */}
        <div
          className="text-text-tertiary flex flex-wrap items-center gap-3 text-sm"
          aria-label="Anime details"
        >
          {/* Rating — star display */}
          <span aria-label={`${slide.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={i < slide.rating ? "text-gold" : "text-void-6"}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </span>

          <span aria-hidden="true" className="text-void-7">
            ·
          </span>

          <span>{slide.episodeCount} episodes</span>

          <span aria-hidden="true" className="text-void-7">
            ·
          </span>

          <span>Season {slide.seasonNumber}</span>
        </div>

        {/* CTA row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button variant="primary" size="lg" aria-label={`Watch now: ${slide.title}`}>
            <Play className="size-4" aria-hidden="true" />
            Watch Now
          </Button>
          <LinkButton
            variant="secondary"
            size="lg"
            href="#"
            aria-label={`More info about ${slide.title}`}
          >
            <Info className="size-4" aria-hidden="true" />
            More Info
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
