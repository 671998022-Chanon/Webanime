// Continue Watching section — Task 14.3
// Horizontal rail of recently-watched anime with watch-progress cards and
// "Resume" actions. Purely presentational for this milestone — driven by mock
// data, no backend calls. Layout is a CSS scroll-snap row: 6 cards visible on
// desktop, 4 on tablet, 1.5 peek on mobile (Home.md §6-8).
//
// The "View All" control in SectionShell is a placeholder for now — it's
// visually hidden and gated behind a future task that wires up /watch-history.

import { MOCK_CONTINUE_WATCHING } from "../mock-continue-watching-data";
import { ProgressCard } from "../progress-card";

import { PlaceholderContent, SectionShell } from "./section";

export function ContinueWatchingSection() {
  const entries = MOCK_CONTINUE_WATCHING;

  // Empty-state guard: should never fire with mock data, but keeps the rail
  // resilient once real data lands (Home.md §13 — hide an empty rail).
  if (entries.length === 0) {
    return (
      <SectionShell id="continue-watching" title="Continue Watching" visible={false}>
        <PlaceholderContent label="Continue Watching rail" />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      id="continue-watching"
      title="Continue Watching"
      subtitle="Pick up where you left off"
    >
      {/* Scroll-snap rail: a flex track inside overflow-x-auto. Card widths
          yield ~1.5 peek on mobile, ~4 on tablet, ~6 on desktop (Home.md §6-8).
          Faded edges (CSS mask-image) hint at more content; degrades gracefully.
          Snap is disabled under prefers-reduced-motion. */}
      <div className="-mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%_-_24px),transparent)] [scrollbar-width:none] md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
        <ul
          className="flex snap-x snap-mandatory gap-4 pb-2 motion-reduce:snap-none md:gap-5 lg:gap-6"
          role="list"
        >
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="w-[42%] min-w-[160px] shrink-0 snap-start sm:w-[32%] md:w-[24%] lg:w-[18%] xl:w-[15.5%]"
            >
              <ProgressCard entry={entry} />
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
