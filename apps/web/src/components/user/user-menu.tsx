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
import {
  User,
  Bookmark,
  Clock3,
  Settings,
  HelpCircle,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";

/**
 * User menu — dropdown below the avatar in the header.
 *
 * All items are placeholders until auth (M3) lands: they are buttons with no handlers and no
 * routing. The signed-out state shows Sign In; the signed-in state (mock user below) shows the
 * full account actions plus Sign Out. Glassmorphic surface matches the design system.
 */
export function UserMenu() {
  // Mock user — replaced by the auth session in M3. signedIn toggles the item set.
  const signedIn = true;
  const user = {
    name: "Anime Fan",
    email: "fan@nexus.anime",
    avatarUrl: null, // no avatar image — fallback shows initials
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
          <span className="text-text-primary hidden text-sm font-medium sm:inline">
            {user.name}
          </span>
          <ChevronDown className="text-text-tertiary size-3" aria-hidden="true" />
        </button>
      </DropdownTrigger>

      <DropdownContent
        align="end"
        sideOffset={8}
        className="bg-surface-overlay border-border-subtle/40 w-56 backdrop-blur-lg"
      >
        {signedIn && (
          <>
            <DropdownLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-text-primary text-sm font-medium">{user.name}</span>
                <span className="text-text-tertiary text-xs">{user.email}</span>
              </div>
            </DropdownLabel>
            <DropdownDivider />
          </>
        )}

        {/* Account actions — only meaningful when signed in. */}
        {signedIn && (
          <>
            <DropdownItem icon={<User className="size-4" />}>Profile</DropdownItem>
            <DropdownItem icon={<Bookmark className="size-4" />}>Watchlist</DropdownItem>
            <DropdownItem icon={<Clock3 className="size-4" />}>History</DropdownItem>
          </>
        )}

        <DropdownItem icon={<Settings className="size-4" />}>Settings</DropdownItem>
        <DropdownItem icon={<HelpCircle className="size-4" />}>Help</DropdownItem>

        <DropdownDivider />

        {signedIn ? (
          <DropdownItem icon={<LogOut className="size-4" />} destructive>
            Sign out
          </DropdownItem>
        ) : (
          <DropdownItem icon={<LogIn className="size-4" />}>Sign in</DropdownItem>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
