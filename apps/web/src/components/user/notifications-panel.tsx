"use client";

import { useState } from "react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownLabel,
  DropdownDivider,
  IconButton,
  Badge,
  Avatar,
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  cn,
} from "@nexus/ui";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  /** Minutes-ago placeholder. No real timestamps in mock data. */
  timeAgo: string;
  read: boolean;
  /** Decorative category mark. */
  category: "episode" | "system" | "social";
}

/** Mock notifications — no backend. Toggled by `hasNotifications` to exercise the empty state. */
const MOCK_NOTIFICATIONS: readonly Notification[] = [
  {
    id: "n1",
    title: "New episode: Attack on Titan",
    description: "Season 4 Episode 28 is now streaming.",
    timeAgo: "2m ago",
    read: false,
    category: "episode",
  },
  {
    id: "n2",
    title: "Jujutsu Kaisen trending",
    description: "A title on your watchlist is trending this week.",
    timeAgo: "1h ago",
    read: false,
    category: "social",
  },
  {
    id: "n3",
    title: "Welcome to Nexus Anime",
    description: "Sign in to save your watchlist and track progress.",
    timeAgo: "1d ago",
    read: true,
    category: "system",
  },
];

const CATEGORY_DOT: Record<Notification["category"], string> = {
  episode: "bg-action-primary-bg",
  social: "bg-aether-5",
  system: "bg-text-tertiary",
};

/**
 * Notifications panel — bell trigger with an unread badge and a dropdown list.
 *
 * All data is mock (no backend, no persistence). The empty state renders when there are no
 * notifications. Keyboard nav, focus trap, and Esc-to-close come from the Radix Dropdown.
 */
export function NotificationsPanel() {
  // Set to false to preview the empty state.
  const [hasNotifications] = useState(true);
  const notifications = hasNotifications ? MOCK_NOTIFICATIONS : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <span className="relative inline-flex">
          <IconButton variant="ghost" size="sm" aria-label="Notifications">
            <Bell className="size-5" />
          </IconButton>
          {unreadCount > 0 && (
            <Badge
              variant="error"
              size="sm"
              className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center px-1"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </Badge>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align="end"
        sideOffset={8}
        className="bg-surface-overlay border-border-subtle/40 w-80 backdrop-blur-lg"
      >
        <DropdownLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="info" size="sm">
              {unreadCount} new
            </Badge>
          )}
        </DropdownLabel>
        <DropdownDivider />

        {notifications.length === 0 ? (
          <div className="px-2 py-6">
            <EmptyState layout="inline" className="gap-1">
              <EmptyStateTitle className="text-base">You're all caught up</EmptyStateTitle>
              <EmptyStateDescription className="text-xs">
                New notifications will appear here.
              </EmptyStateDescription>
            </EmptyState>
          </div>
        ) : (
          <ul className="flex max-h-80 flex-col overflow-y-auto">
            {notifications.map((notification, index) => (
              <li key={notification.id}>
                {index > 0 && <DropdownDivider />}
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 text-left",
                    "ease-spring transition-colors duration-150",
                    "hover:bg-action-ghost-hover focus-visible:bg-action-ghost-hover focus-visible:outline-none",
                    !notification.read && "bg-aether-4/5",
                  )}
                >
                  <Avatar size="sm" className="mt-0.5">
                    <Avatar.Fallback>
                      <span
                        className={cn(
                          "block h-2 w-2 rounded-[var(--radius-full)]",
                          CATEGORY_DOT[notification.category],
                        )}
                        aria-hidden="true"
                      />
                    </Avatar.Fallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          notification.read
                            ? "text-text-secondary"
                            : "text-text-primary font-medium",
                        )}
                      >
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span
                          className="bg-action-primary-bg h-1.5 w-1.5 shrink-0 rounded-[var(--radius-full)]"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="text-text-tertiary mt-0.5 block truncate text-xs">
                      {notification.description}
                    </span>
                    <span className="text-text-placeholder mt-1 block text-xs">
                      {notification.timeAgo}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
