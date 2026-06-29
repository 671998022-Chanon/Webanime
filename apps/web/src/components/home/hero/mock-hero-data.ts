// Mock hero data — Task 14.2
// Reusable mock data source for the Hero Banner. Contains 3 featured anime
// entries. No API calls — pure static data for development and demonstration.

export interface HeroSlideData {
  /** Unique identifier for the slide. */
  id: string;
  /** anime title (display heading). */
  title: string;
  /** Short description or tagline. */
  subtitle: string;
  /** Genre labels displayed as badges. */
  genres: string[];
  /** Star rating out of 5 (integer). */
  rating: number;
  /** Total number of available episodes. */
  episodeCount: number;
  /** Aired season label (e.g. "Fall 2025"). */
  season: string;
  /** Season number within the series. */
  seasonNumber: number;
  /** Current airing status. */
  status: "airing" | "completed" | "upcoming";
  /** Background image URL (mock — placeholder images). */
  backgroundImage: string;
}

export const MOCK_HERO_SLIDES: HeroSlideData[] = [
  {
    id: "wind-breaker-s2",
    title: "Wind Breaker",
    subtitle:
      "Haruka Sakura returns to protect his town with new allies and fierce rivalries. The streets demand strength — and heart.",
    genres: ["Action", "Drama", "School"],
    rating: 5,
    episodeCount: 13,
    season: "Spring 2025",
    seasonNumber: 2,
    status: "airing",
    backgroundImage: "/images/hero/wind-breaker-bg.jpg",
  },
  {
    id: "solo-leveling-s2",
    title: "Solo Leveling",
    subtitle:
      "Sung Jinwoo ascends beyond S-Rank. With the Shadow Army at full strength, a new monarch awakens — and the gates are breaking.",
    genres: ["Action", "Fantasy", "Adventure"],
    rating: 5,
    episodeCount: 13,
    season: "Winter 2025",
    seasonNumber: 2,
    status: "completed",
    backgroundImage: "/images/hero/solo-leveling-bg.jpg",
  },
  {
    id: "dandadan",
    title: "Dandadan",
    subtitle:
      "Aliens and ghosts collide when Momo and Okarun uncover a supernatural conspiracy that defies every rule of the occult.",
    genres: ["Action", "Comedy", "Supernatural"],
    rating: 4,
    episodeCount: 12,
    season: "Fall 2024",
    seasonNumber: 1,
    status: "completed",
    backgroundImage: "/images/hero/dandadan-bg.jpg",
  },
];
