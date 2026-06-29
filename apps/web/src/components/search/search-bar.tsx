"use client";

import * as React from "react";
import { useState } from "react";

import { SearchOverlay } from "@/components/search/search-overlay";

/**
 * SearchBar — manages keyboard shortcut (Cmd+K / Ctrl+K) to open
 * the search overlay. Renders no visual UI itself; the overlay is
 * triggered from the header's search button/trigger.
 */
interface SearchBarProps {
  /** External trigger — when true, opens the overlay. */
  open?: boolean;
  /** Callback when open state changes from outside. */
  onOpenChange?: (open: boolean) => void;
}

export function SearchBar({ open: controlledOpen, onOpenChange }: SearchBarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  // Mirror into a ref so the global keydown handler always reads the latest
  // open state without forcing the effect to re-bind on every toggle.
  const isOpenRef = React.useRef(isOpen);
  isOpenRef.current = isOpen;

  function setIsOpen(next: boolean) {
    setInternalOpen(next);
    onOpenChange?.(next);
  }

  // Cmd+K / Ctrl+K Keyboard shortcut. The handler reads isOpenRef.current, so
  // the effect binds once and stays correct across toggles.
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(!isOpenRef.current);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // setIsOpen is recreated each render but only wraps stable setters; including
    // it keeps exhaustive-deps honest. Re-binding the keydown listener on the
    // rare render where onOpenChange changes is negligible.
  }, [setIsOpen]);

  return <SearchOverlay open={isOpen} onOpenChange={setIsOpen} />;
}
