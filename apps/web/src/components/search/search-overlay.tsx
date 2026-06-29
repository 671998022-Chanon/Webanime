"use client";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
} from "@nexus/ui";
import { Search, Clock, TrendingUp, Sparkles } from "lucide-react";
import * as React from "react";

import { SearchAnimeCard } from "@/components/search/search-anime-card";

/** Mock trending searches. */
const TRENDING_QUERIES = [
  "Solo Leveling Season 2",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "One Piece",
  "Attack on Titan",
  "Chainsaw Man",
] as const;

/** Mock recent searches. */
const RECENT_QUERIES = ["Spy x Family", "Frieren", "Mushoku Tensei"] as const;

/** Mock quick commands. */
const QUICK_ACTIONS = [
  { label: "Go to Browse", shortcut: "G B", href: "/browse" },
  { label: "Go to Watchlist", shortcut: "G W", href: "/watchlist" },
  { label: "Go to Settings", shortcut: "G S", href: "/settings" },
] as const;

interface MockAnime {
  id: string;
  title: string;
  type: "TV" | "Movie" | "OVA" | "ONA" | "Special";
  episodeCount?: number;
  score?: number;
}

/**
 * Mock suggested anime shown in the empty state (no query).
 * UI-only — wire up real catalog data in M4+.
 */
const SUGGESTED_ANIME: MockAnime[] = [
  { id: "s1", title: "Frieren: Beyond Journey's End", type: "TV", episodeCount: 28, score: 9.2 },
  { id: "s2", title: "Solo Leveling", type: "TV", episodeCount: 12, score: 8.6 },
  {
    id: "s3",
    title: "Demon Slayer: Hashira Training Arc",
    type: "TV",
    episodeCount: 8,
    score: 8.4,
  },
  { id: "s4", title: "Oshi no Ko", type: "TV", episodeCount: 11, score: 8.9 },
  { id: "s5", title: "Jujutsu Kaisen", type: "TV", episodeCount: 24, score: 8.4 },
  { id: "s6", title: "Suzume", type: "Movie", score: 7.8 },
];

/**
 * Mock search results keyed by query. A small set of queries resolve to
 * results so the results + loading states are demonstrable; anything else
 * falls through to the no-results empty state. Pure mock — no API.
 */
// With `noUncheckedIndexedAccess` enabled, array indexing includes
// `undefined`; these entries are guaranteed present by the const above.
const RESULTS_BY_QUERY: Record<string, MockAnime[]> = {
  frieren: [SUGGESTED_ANIME[0]!],
  "solo leveling": [SUGGESTED_ANIME[1]!],
  slayer: [SUGGESTED_ANIME[2]!],
  oshi: [SUGGESTED_ANIME[3]!],
  jujutsu: [SUGGESTED_ANIME[4]!],
  suzume: [SUGGESTED_ANIME[5]!],
};

/** Number of loading placeholder cards shown while a query "resolves". */
const LOADING_CARD_COUNT = 3;

interface SearchOverlayProps {
  /** Whether the command dialog is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-screen search overlay using CommandDialog (cmdk).
 *
 * States (all mock, no backend):
 *   - Empty (no query): trending, recent, suggested anime, quick actions.
 *   - Loading:   query recognized → shimmer placeholders via CommandLoading.
 *   - Results:   query resolves → mock result cards.
 *   - No results: query unrecognized → CommandEmpty message.
 *
 * Integration note: query resolution here is instantaneous mock state — there
 * is no debounce, fetch, or persistence (out of scope for this task). The
 * loading→results transition uses a short timeout so the loading placeholder
 * is visibly demonstrable; this is UI-only scaffolding for M4+.
 */
export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasResults, setHasResults] = React.useState(false);
  const loadingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset transient state whenever the dialog closes.
  React.useEffect(() => {
    if (!open) {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current);
      loadingTimeout.current = null;
      setQuery("");
      setIsLoading(false);
      setHasResults(false);
    }
  }, [open]);

  // Derive mock results as the query changes. No debounce — immediate mock.
  const handleValueChange = React.useCallback((value: string) => {
    setQuery(value);
    if (loadingTimeout.current) clearTimeout(loadingTimeout.current);

    const hasQuery = value.trim().length > 0;
    setHasResults(false);

    if (!hasQuery) {
      setIsLoading(false);
      return;
    }

    // Recognized query → show loading, then results after a short mock delay.
    const key = value.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(RESULTS_BY_QUERY, key)) {
      setIsLoading(true);
      loadingTimeout.current = setTimeout(() => {
        setIsLoading(false);
        setHasResults(true);
      }, 450);
    } else {
      setIsLoading(false);
    }
  }, []);

  const results = React.useMemo((): MockAnime[] | undefined => {
    const key = query.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(RESULTS_BY_QUERY, key)
      ? RESULTS_BY_QUERY[key]
      : undefined;
  }, [query]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search anime, genres, or type a command..."
        value={query}
        onValueChange={handleValueChange}
      />
      <CommandList>
        {/* Loading placeholder — shown while a recognized query resolves. */}
        {isLoading && (
          <CommandLoading>
            <div className="space-y-1 px-2 py-2" aria-busy="true" aria-live="polite">
              {Array.from({ length: LOADING_CARD_COUNT }, (_, i) => (
                <SearchAnimeCard
                  // cmdk keys must be unique; these are transient loading rows
                  key={`loading-${i}`}
                  title=""
                  type="TV"
                  loading
                />
              ))}
            </div>
          </CommandLoading>
        )}

        {/* No-results empty state — cmdk shows this when the query is
            non-empty but nothing matches and we are not loading. */}
        <CommandEmpty>
          <div className="py-4 text-center">
            <p className="text-text-secondary text-sm">No results for &ldquo;{query}&rdquo;.</p>
            <p className="text-text-tertiary mt-1 text-xs">Try a trending search.</p>
          </div>
        </CommandEmpty>

        {/* Results — rendered once the mock query resolves. */}
        {hasResults && !isLoading && results && results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((anime) => (
              <SearchAnimeCard
                key={anime.id}
                title={anime.title}
                type={anime.type}
                episodeCount={anime.episodeCount}
                score={anime.score}
                onSelect={() => onOpenChange(false)}
              />
            ))}
          </CommandGroup>
        )}

        {/* Empty-state groups — hidden automatically by cmdk once a query is
            entered that matches an item above. */}
        <CommandGroup heading="Suggested">
          {SUGGESTED_ANIME.map((anime) => (
            <SearchAnimeCard
              key={anime.id}
              title={anime.title}
              type={anime.type}
              episodeCount={anime.episodeCount}
              score={anime.score}
              onSelect={() => onOpenChange(false)}
            />
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent">
          {RECENT_QUERIES.map((q) => (
            <CommandItem key={q} value={q} onSelect={() => onOpenChange(false)}>
              <Clock className="text-text-tertiary size-4" aria-hidden="true" />
              <span>{q}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Trending">
          {TRENDING_QUERIES.map((q) => (
            <CommandItem key={q} value={q} onSelect={() => onOpenChange(false)}>
              <TrendingUp className="size-4 text-[var(--nexus-nova-4)]" aria-hidden="true" />
              <span>{q}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem key={action.label} onSelect={() => onOpenChange(false)}>
              <Sparkles className="size-4 text-[var(--nexus-aether-5)]" aria-hidden="true" />
              <span>{action.label}</span>
              <CommandShortcut>{action.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
