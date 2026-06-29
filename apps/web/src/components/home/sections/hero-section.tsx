// Hero section — Task 14.2
// Premium cinematic hero banner for the homepage. Renders a full-width
// carousel of featured anime with glassmorphism content panels, gradient
// overlays, decorative effects, prev/next navigation, and pagination dots.
// Uses mock data only — no API calls, no auto-play.

import { HeroBanner, MOCK_HERO_SLIDES } from "../hero";

export function HeroSection() {
  return <HeroBanner slides={MOCK_HERO_SLIDES} />;
}
