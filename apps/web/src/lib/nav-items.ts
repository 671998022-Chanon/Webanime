import {
  Home,
  Compass,
  Clock,
  Heart,
  BookmarkPlus,
  Settings,
  TrendingUp,
  Sparkles,
  Layers,
  PlayCircle,
  CalendarDays,
  Trophy,
  HelpCircle,
  Info,
} from "lucide-react";

/** Navigation item consumed by the sidebar and mobile drawer. */
export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Primary navigation items — desktop sidebar + mobile drawer. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/continue-watching", label: "Continue Watching", icon: Clock },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
  { href: "/bookmarks", label: "Bookmarks", icon: BookmarkPlus },
];

/** Secondary navigation items (bottom of sidebar / drawer). */
export const SECONDARY_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Header navigation items — desktop global nav in the header. */
export const HEADER_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/latest", label: "Latest" },
  { href: "/genres", label: "Genres" },
  { href: "/schedule", label: "Schedule" },
] as const;

/** A labeled navigation group rendered as a section in the desktop sidebar. */
export interface NavGroup {
  /** Stable id, also used to build the group header's DOM id (`group-{id}-header`). */
  id: string;
  /** Group header label (rendered only when the sidebar is expanded). */
  label: string;
  items: NavItem[];
}

/**
 * Primary navigation groups — desktop sidebar only.
 * Order is render order. Route grouping mirrors the header's Browse mega-menu
 * contract (Discover = public catalog, Library = personal, Community = social).
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "discover",
    label: "Discover",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/trending", label: "Trending", icon: TrendingUp },
      { href: "/latest", label: "Latest", icon: Sparkles },
      { href: "/genres", label: "Genres", icon: Layers },
    ],
  },
  {
    id: "library",
    label: "Library",
    items: [
      { href: "/continue-watching", label: "Continue Watching", icon: PlayCircle },
      { href: "/watchlist", label: "Watchlist", icon: Heart },
      { href: "/history", label: "History", icon: Clock },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      { href: "/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/rankings", label: "Rankings", icon: Trophy },
    ],
  },
];

/** Footer navigation items — rendered below a separator with the collapse toggle. */
export const SIDEBAR_FOOTER: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/about", label: "About", icon: Info },
];

/**
 * Pure active-state helper. `/` is matched exactly so Home does not highlight on
 * every route; other routes also match their own sub-paths (e.g. `/genres/sci-fi`
 * keeps Genres active). Mirrors the header's Browse mega-menu grouping.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
