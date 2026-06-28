"use client";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@nexus/ui";
import { Search, Clock, TrendingUp, Sparkles } from "lucide-react";

/** Mock trending searches */
const TRENDING_QUERIES = [
  "Solo Leveling Season 2",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "One Piece",
  "Attack on Titan",
  "Chainsaw Man",
] as const;

/** Mock recent searches */
const RECENT_QUERIES = ["Spy x Family", "Frieren", "Mushoku Tensei"] as const;

/** Mock quick actions */
const QUICK_ACTIONS = [
  { label: "Go to Browse", shortcut: "G B", href: "/browse" },
  { label: "Go to Watchlist", shortcut: "G W", href: "/watchlist" },
  { label: "Go to Settings", shortcut: "G S", href: "/settings" },
] as const;

interface SearchOverlayProps {
  /** Whether the command dialog is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-screen search overlay using CommandDialog (cmdk).
 * Shows trending queries, recent searches, and quick actions.
 * No API connection — all data is mock. Wire up real search in M4+.
 */
export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search anime, genres, or type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Trending">
          {TRENDING_QUERIES.map((query) => (
            <CommandItem key={query} onSelect={() => onOpenChange(false)}>
              <TrendingUp className="text-nova-4 size-4" aria-hidden="true" />
              <span>{query}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Recent">
          {RECENT_QUERIES.map((query) => (
            <CommandItem key={query} onSelect={() => onOpenChange(false)}>
              <Clock className="text-text-tertiary size-4" aria-hidden="true" />
              <span>{query}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem key={action.label} onSelect={() => onOpenChange(false)}>
              <Sparkles className="text-aether-5 size-4" aria-hidden="true" />
              <span>{action.label}</span>
              <CommandShortcut>{action.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
