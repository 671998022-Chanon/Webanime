"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
  Avatar,
  cn,
} from "@nexus/ui";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

/**
 * User menu — dropdown below avatar in the header.
 * Shows user name/email, profile link, settings, sign out.
 * Uses mock user data until auth (M3) is integrated.
 * Glassmorphic dropdown surface matching the design system.
 */
export function UserMenu() {
  // Mock user — will be replaced by auth session in M3
  const user = {
    name: "Anime Fan",
    email: "fan@nexus.anime",
    avatarUrl: null, // no avatar image — fallback initials
  };

  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-3)]",
            "ease-spring transition-colors duration-150",
            "hover:bg-action-ghost-hover",
            "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "px-1.5 py-1",
          )}
          aria-label="User menu"
        >
          <Avatar size="sm">
            {user.avatarUrl ? (
              <Avatar.Image src={user.avatarUrl} alt={user.name} />
            ) : (
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            )}
          </Avatar>
          <ChevronDown className="text-text-tertiary size-3" aria-hidden="true" />
        </button>
      </DropdownTrigger>

      <DropdownContent
        align="end"
        sideOffset={8}
        className="bg-surface-overlay border-border-subtle/40 backdrop-blur-lg"
      >
        <DropdownLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-primary text-sm font-medium">{user.name}</span>
            <span className="text-text-tertiary text-xs">{user.email}</span>
          </div>
        </DropdownLabel>

        <DropdownDivider />

        <DropdownItem icon={<User className="size-4" />}>Profile</DropdownItem>
        <DropdownItem icon={<Settings className="size-4" />}>Settings</DropdownItem>

        <DropdownDivider />

        <DropdownItem icon={<LogOut className="size-4" />} destructive>
          Sign out
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}
