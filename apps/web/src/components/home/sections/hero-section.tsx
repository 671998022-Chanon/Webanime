// Hero section — Task 14.1 placeholder
// Placeholder skeleton for the homepage hero. Renders a dashed placeholder
// container spanning the full viewport width, just below the sticky header.
// No carousel, no rotating slides, no CTA. They land in Task 14.2+.

import { Typography } from "@nexus/ui";

export function HeroSection() {
  return (
    <section
      id="home-hero"
      aria-labelledby="home-hero-heading"
      data-slot="section-hero"
      className="border-border-subtle/40 relative w-full border-b"
    >
      {/* Hero spans the full viewport width to anchor the page visually.
          Inner container constrains content to 1200px (matching grid-sm max-width
          from docs/04-design-system/Grid-System.md §Grid Configuration). */}
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
        <div
          role="presentation"
          className="bg-surface-sunken/30 border-border-subtle/50 flex min-h-[360px] flex-col justify-end gap-4 rounded-[var(--radius-4)] border border-dashed p-6 md:min-h-[480px] md:p-8 lg:min-h-[560px] lg:p-10"
        >
          {/* Eyebrow / pill */}
          <span
            aria-hidden="true"
            className="bg-surface-raised/60 border-border-subtle/50 text-text-tertiary self-start rounded-[var(--radius-full)] border px-3 py-1 text-xs"
          >
            Featured
          </span>

          {/* Title placeholder */}
          <Typography
            element="h1"
            id="home-hero-heading"
            size="4xl"
            weight="bold"
            className="text-text-primary max-w-2xl"
          >
            Hero Banner Placeholder
          </Typography>

          {/* Subtitle placeholder */}
          <Typography element="p" size="md" className="text-text-secondary max-w-xl">
            Featured anime will be displayed here in a future milestone.
          </Typography>

          {/* Meta row placeholder */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-surface-raised/40 text-text-tertiary rounded-[var(--radius-1)] px-2 py-1 text-xs"
            >
              ★ ★ ★ ★ ★
            </span>
            <span
              aria-hidden="true"
              className="bg-surface-raised/40 text-text-tertiary rounded-[var(--radius-1)] px-2 py-1 text-xs"
            >
              · Season ·
            </span>
            <span
              aria-hidden="true"
              className="bg-surface-raised/40 text-text-tertiary rounded-[var(--radius-1)] px-2 py-1 text-xs"
            >
              00 episodes
            </span>
          </div>

          {/* CTA placeholder row */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-action-primary-bg text-action-primary-text rounded-[var(--radius-3)] px-5 py-2.5 text-sm font-medium"
            >
              Watch now
            </span>
            <span
              aria-hidden="true"
              className="bg-surface-raised/60 border-border-subtle/60 text-text-primary rounded-[var(--radius-3)] border px-5 py-2.5 text-sm font-medium"
            >
              + Watchlist
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
