// Mock continue-watching data — Task 14.3
// Reusable mock data source for the Continue Watching rail. Contains 6
// recently-watched anime entries with resume progress. No API calls — pure
// static data for development and demonstration. Stored separately from UI
// components so the production data layer can replace the import in one spot.

export interface ContinueWatchingEntry {
  /** Unique identifier for the anime. */
  id: string;
  /** Anime title (display heading). */
  title: string;
  /** Poster image URL (mock — placeholder images). */
  posterImage: string;
  /** Episode number the user is currently on. */
  currentEpisode: number;
  /** Total number of available episodes (null if unknown/ongoing). */
  totalEpisodes: number | null;
  /** Watch progress percentage (0–100). Drives the progress bar. */
  progressPct: number;
  /** Human-readable remaining time for the current episode (e.g. "18m left"). */
  remainingTime: string;
  /** Human-readable "last watched" label (e.g. "2h ago"). */
  watchedAt: string;
  /** Current airing status — drives the episode badge variant. */
  status: "airing" | "completed" | "upcoming";
}

export const MOCK_CONTINUE_WATCHING: ContinueWatchingEntry[] = [
  {
    id: "wind-breaker-s2",
    title: "Wind Breaker",
    posterImage: "/images/posters/wind-breaker.jpg",
    currentEpisode: 8,
    totalEpisodes: 13,
    progressPct: 62,
    remainingTime: "14m left",
    watchedAt: "2h ago",
    status: "airing",
  },
  {
    id: "solo-leveling-s2",
    title: "Solo Leveling",
    posterImage: "/images/posters/solo-leveling.jpg",
    currentEpisode: 5,
    totalEpisodes: 13,
    progressPct: 38,
    remainingTime: "20m left",
    watchedAt: "Yesterday",
    status: "completed",
  },
  {
    id: "dandadan",
    title: "Dandadan",
    posterImage: "/images/posters/dandadan.jpg",
    currentEpisode: 11,
    totalEpisodes: 12,
    progressPct: 91,
    remainingTime: "4m left",
    watchedAt: "3d ago",
    status: "completed",
  },
  {
    id: "blue-lock-s2",
    title: "Blue Lock",
    posterImage: "/images/posters/blue-lock.jpg",
    currentEpisode: 16,
    totalEpisodes: 24,
    progressPct: 67,
    remainingTime: "12m left",
    watchedAt: "12h ago",
    status: "airing",
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    posterImage: "/images/posters/frieren.jpg",
    currentEpisode: 22,
    totalEpisodes: 28,
    progressPct: 78,
    remainingTime: "9m left",
    watchedAt: "5h ago",
    status: "completed",
  },
  {
    id: "kaiju-no-8",
    title: "Kaiju No. 8",
    posterImage: "/images/posters/kaiju-no-8.jpg",
    currentEpisode: 4,
    totalEpisodes: null,
    progressPct: 33,
    remainingTime: "17m left",
    watchedAt: "1d ago",
    status: "airing",
  },
];
