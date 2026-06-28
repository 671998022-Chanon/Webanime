"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query matches. SSR-safe — returns `defaultValue`
 * until the client hydrates. Uses `matchMedia` with `change` event listener.
 *
 * @param query - CSS media query string, e.g. "(min-width: 768px)"
 * @param defaultValue - value returned during SSR / before hydration
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
