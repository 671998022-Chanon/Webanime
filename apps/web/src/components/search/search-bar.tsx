"use client";

import { useEffect, useState } from "react";

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

  function setIsOpen(next: boolean) {
    setInternalOpen(next);
    onOpenChange?.(next);
  }

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return <SearchOverlay open={isOpen} onOpenChange={setIsOpen} />;
}
