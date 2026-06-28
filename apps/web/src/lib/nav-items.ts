import { Home, Compass, Clock, Heart, BookmarkPlus, Settings } from "lucide-react";

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
