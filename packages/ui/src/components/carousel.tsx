// @nexus/ui — Carousel foundation (compound)
// Generic horizontal scroll container with prev/next navigation buttons.
// No auto-play, no data fetching. Pure layout + navigation.
// Scroll state shared via React Context between Container, Content, Item, Previous, Next.

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/* ---------------- Context ---------------- */

interface CarouselContextValue {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const CarouselContext = React.createContext<CarouselContextValue>({
  scrollPrev: () => {},
  scrollNext: () => {},
  canScrollPrev: false,
  canScrollNext: false,
  contentRef: { current: null },
});

/* ---------------- Root ---------------- */

export const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const update = React.useCallback(() => {
      const el = contentRef.current;
      if (!el) return;
      setCanScrollPrev(el.scrollLeft > 0);
      setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }, []);

    React.useEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      update();
      el.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      return () => {
        el.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    }, [update]);

    const scrollPrev = React.useCallback(() => {
      const el = contentRef.current;
      if (el) el.scrollBy({ left: -el.clientWidth * 0.8, behavior: "smooth" });
    }, []);

    const scrollNext = React.useCallback(() => {
      const el = contentRef.current;
      if (el) el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
    }, []);

    const contextValue = React.useMemo<CarouselContextValue>(
      () => ({ scrollPrev, scrollNext, canScrollPrev, canScrollNext, contentRef }),
      [scrollPrev, scrollNext, canScrollPrev, canScrollNext],
    );

    return (
      <CarouselContext.Provider value={contextValue}>
        <div ref={ref} data-slot="carousel" className={cn("relative", className)} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

/* ---------------- Content ---------------- */

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { contentRef } = React.useContext(CarouselContext);

  // Merge external ref with internal contentRef so Carousel can measure this element.
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [contentRef, ref],
  );

  return (
    <div
      ref={setRef}
      data-slot="carousel-content"
      className={cn(
        "flex overflow-x-auto scroll-smooth",
        "snap-x snap-mandatory",
        "[&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CarouselContent.displayName = "Carousel.Content";

/* ---------------- Item ---------------- */

export const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="carousel-item"
      className={cn("shrink-0 snap-start", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
CarouselItem.displayName = "Carousel.Item";

/* ---------------- Previous ---------------- */

export interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselPreviousProps>(
  ({ className, ...props }, ref) => {
    const { scrollPrev, canScrollPrev } = React.useContext(CarouselContext);
    return (
      <button
        ref={ref}
        type="button"
        data-slot="carousel-previous"
        aria-label="Previous slide"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          "bg-surface-overlay/80 absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2",
          "text-text-primary shadow-1 backdrop-blur-sm transition-opacity duration-200",
          "hover:bg-surface-overlay focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-30",
          className,
        )}
        {...props}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    );
  },
);
CarouselPrevious.displayName = "Carousel.Previous";

/* ---------------- Next ---------------- */

export interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, ...props }, ref) => {
    const { scrollNext, canScrollNext } = React.useContext(CarouselContext);
    return (
      <button
        ref={ref}
        type="button"
        data-slot="carousel-next"
        aria-label="Next slide"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          "bg-surface-overlay/80 absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2",
          "text-text-primary shadow-1 backdrop-blur-sm transition-opacity duration-200",
          "hover:bg-surface-overlay focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-30",
          className,
        )}
        {...props}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    );
  },
);
CarouselNext.displayName = "Carousel.Next";

export { CarouselPrevious, CarouselNext };
