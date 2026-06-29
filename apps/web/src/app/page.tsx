// Homepage route — Task 14.1
// Server Component. Serves as the primary landing surface at `/`.
// The page composes six placeholder sections (hero + five content rails);
// data fetching and actual UI are out of scope for this task and land in
// Task 14.2+. See docs/13-features/Home.md for the full Home specification.

import { HomePage } from "@/components/home/home-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Stream premium anime on Nexus Anime — cinematic, personalized, and built for gaming-crossover fans.",
};

export default function Home() {
  return <HomePage />;
}
