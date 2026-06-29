// Homepage layout — Task 14.1
// Structural skeleton for the / route. Composes six placeholder sections in
// design-system order (see docs/13-features/Home.md §7):
//   1. Hero
//   2. Continue Watching
//   3. Trending
//   4. Latest Episodes
//   5. Popular
//   6. Genres
// Each section is a Server Component placeholder — no data fetching, no business
// logic, no animations. Content rails land in later milestones (14.2+).
// Semantic HTML (<main>/<section>), responsive gutters (16/24/32), and the
// 1200px content max-width follow docs/04-design-system/{Grid,Spacing}System.md.

import { ContinueWatchingSection } from "./sections/continue-watching-section";
import { GenresSection } from "./sections/genres-section";
import { HeroSection } from "./sections/hero-section";
import { LatestEpisodesSection } from "./sections/latest-episodes-section";
import { PopularSection } from "./sections/popular-section";
import { TrendingSection } from "./sections/trending-section";

export function HomePage() {
  return (
    <main
      id="home"
      className="relative w-full pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    >
      {/* Hero sits flush against the header (no extra top gutter); it sets
          the page's visual anchor. */}
      <HeroSection />

      {/* Content rails share a max-width container and a vertical rhythm.
          Per Spacing.md §Layout Spacing: section gap = 32/40/48px
          (mobile/tablet/desktop). We apply the gap between rails with
          spacer `stack-spacing-6`-equivalent classes. */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 py-12 md:gap-16 md:px-6 md:py-16 lg:gap-20 lg:px-8 lg:py-20">
        <ContinueWatchingSection />
        <TrendingSection />
        <LatestEpisodesSection />
        <PopularSection />
        <GenresSection />
      </div>
    </main>
  );
}
