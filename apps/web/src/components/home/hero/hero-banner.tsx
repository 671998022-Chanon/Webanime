// Hero Banner — Task 14.2
// Compound client component: full-width cinematic banner with slide navigation
// (prev/next + pagination dots). No auto-play. Holds current slide index in
// state and shares it via context. Background uses gradient overlays and
// decorative ambient glows per the Design System.

"use client";

import { cn, Container } from "@nexus/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { HeroSlide } from "./hero-slide";
import { type HeroSlideData } from "./mock-hero-data";

/* ─── Context ─── */

interface HeroBannerContextValue {
  currentSlide: number;
  totalSlides: number;
  goTo: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
}

const HeroBannerContext = React.createContext<HeroBannerContextValue>({
  currentSlide: 0,
  totalSlides: 0,
  goTo: () => {},
  goPrev: () => {},
  goNext: () => {},
});

/* ─── Props ─── */

export interface HeroBannerProps {
  /** Ordered list of slide data. At least one entry required. */
  slides: HeroSlideData[];
  /** Additional class name on the root section element. */
  className?: string;
}

/* ─── Component ─── */

export function HeroBanner({ slides, className }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const totalSlides = slides.length;

  const goTo = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) setCurrentSlide(index);
    },
    [totalSlides],
  );

  const goPrev = React.useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  const goNext = React.useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const contextValue = React.useMemo(
    () => ({ currentSlide, totalSlides, goTo, goPrev, goNext }),
    [currentSlide, totalSlides, goTo, goPrev, goNext],
  );

  const activeSlide = slides[currentSlide];

  // Defensive: if slides array is empty there's nothing to render.
  if (!activeSlide) return null;

  return (
    <HeroBannerContext.Provider value={contextValue}>
      <section
        id="home-hero"
        aria-labelledby="hero-slide-heading"
        aria-label="Featured anime"
        aria-roledescription="carousel"
        data-slot="section-hero"
        className={cn("relative w-full overflow-hidden", className)}
      >
        {/* Responsive height: 320 / 400 / 480 per Home.md §6-8 */}
        <div className="relative min-h-[320px] md:min-h-[400px] lg:min-h-[480px]">
          {/* ── Background image layer ── */}
          {/* Next.js Image not used intentionally — the background images
              are decorative (role=presentation) and need object-cover fill
              behaviour on a positioned div. Using a plain div with bg-cover
              avoids extra markup and keeps CSS-only crossfade possible. */}
          <div
            key={activeSlide.id}
            role="presentation"
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
            style={{ backgroundImage: `url(${activeSlide.backgroundImage})` }}
          />

          {/* Fallback gradient if image fails to load — ensures the section
              always has visual interest (Glassmorphism.md §Background Requirements). */}
          <div
            role="presentation"
            aria-hidden="true"
            className="bg-gradient-hero absolute inset-0"
          />

          {/* ── Gradient overlay — bottom fade for text readability ── */}
          <div
            role="presentation"
            aria-hidden="true"
            className="bg-gradient-overlay absolute inset-0"
          />

          {/* ── Side gradient — fades content edge to surface base ── */}
          <div
            role="presentation"
            aria-hidden="true"
            className="from-surface-base absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l to-transparent md:block"
          />

          {/* ── Decorative ambient glow ── */}
          {/* Subtle aether glow at top-left per --nexus-glow-md.
              Creates visual interest behind glass panels. */}
          <div
            role="presentation"
            aria-hidden="true"
            className="absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-60 blur-[80px] [background:var(--nexus-aether-4)]"
          />
          <div
            role="presentation"
            aria-hidden="true"
            className="absolute -bottom-10 right-1/4 h-60 w-60 rounded-full opacity-30 blur-[60px] [background:var(--nexus-nova-4)]"
          />

          {/* ── Content area — constrained width, slides over background ── */}
          <Container
            size="2xl"
            className="relative z-10 flex h-full min-h-[320px] md:min-h-[400px] lg:min-h-[480px]"
          >
            {/* Active slide content */}
            <div
              key={activeSlide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${currentSlide + 1} of ${totalSlides}: ${activeSlide.title}`}
              className="ease-spring absolute inset-0 transition-opacity duration-500"
            >
              <HeroSlide slide={activeSlide} />
            </div>
          </Container>

          {/* ── Navigation: Prev / Next arrows ── */}
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={goPrev}
                className={cn(
                  "absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full p-2",
                  "bg-surface-overlay/80 text-text-primary shadow-1 backdrop-blur-sm",
                  "ease-spring transition-[background-color,opacity] duration-200",
                  "hover:bg-surface-overlay focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
                  "md:left-5 md:p-2.5",
                )}
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              <button
                type="button"
                aria-label="Next slide"
                onClick={goNext}
                className={cn(
                  "absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full p-2",
                  "bg-surface-overlay/80 text-text-primary shadow-1 backdrop-blur-sm",
                  "ease-spring transition-[background-color,opacity] duration-200",
                  "hover:bg-surface-overlay focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
                  "md:right-5 md:p-2.5",
                )}
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </>
          )}

          {/* ── Pagination dots ── */}
          {totalSlides > 1 && (
            <div
              className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-6"
              role="tablist"
              aria-label="Slide navigation"
            >
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === currentSlide}
                  aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "ease-spring h-2 rounded-full transition-[width,background-color] duration-200",
                    i === currentSlide ? "bg-aether-4 w-6" : "bg-void-8/60 hover:bg-void-9/80 w-2",
                    "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </HeroBannerContext.Provider>
  );
}
