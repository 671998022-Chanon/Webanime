"use client";

import { useEffect, useState } from "react";

interface ScrollPosition {
  /** Current vertical scroll position in pixels. */
  scrollY: number;
  /** Whether the user has scrolled past the threshold (default 10px). */
  isScrolled: boolean;
}

/**
 * Tracks window scroll position. Returns { scrollY, isScrolled }.
 * isScrolled flips true once the user scrolls past `threshold` pixels.
 * Uses passive scroll listener for performance. SSR-safe — returns 0/false
 * until the client hydrates.
 */
export function useScrollPosition(threshold = 10): ScrollPosition {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      setScrollY(y);
      setIsScrolled(y > threshold);
    }

    // Check initial position in case page loads scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { scrollY, isScrolled };
}
