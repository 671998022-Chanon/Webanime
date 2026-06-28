import { Container, Separator } from "@nexus/ui";
import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Browse",
    links: [
      { href: "/browse", label: "All Anime" },
      { href: "/browse?trending=true", label: "Trending" },
      { href: "/browse?season=current", label: "This Season" },
      { href: "/browse?sort=rating", label: "Top Rated" },
    ],
  },
  {
    title: "Library",
    links: [
      { href: "/watchlist", label: "Watchlist" },
      { href: "/continue-watching", label: "Continue Watching" },
      { href: "/bookmarks", label: "Bookmarks" },
      { href: "/history", label: "History" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/discussions", label: "Discussions" },
      { href: "/reviews", label: "Reviews" },
      { href: "/recommendations", label: "Recommendations" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/help", label: "Help Center" },
    ],
  },
] as const;

/**
 * Global footer — 4 columns on desktop, 2 on tablet, stacked on mobile.
 * Glassmorphic surface. Renders Nexus branding, nav columns, and copyright.
 * This is a Server Component — no interactivity.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      data-slot="footer"
      className="border-border-subtle/40 bg-surface-sunken/60 mt-auto border-t backdrop-blur-sm"
    >
      <Container size="2xl" className="px-4 pb-8 pt-12 md:px-6">
        {/* Navigation columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-text-primary text-sm font-semibold">{section.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-tertiary ease-spring hover:text-text-secondary focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base rounded-[var(--radius-1)] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator orientation="horizontal" className="my-8" />

        {/* Bottom bar: branding + copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            {/* Logo mark — matches header */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="28" height="28" rx="6" className="fill-action-accent-bg" />
              <path
                d="M8 8L14 20L20 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-action-accent-text"
              />
            </svg>
            <span className="font-display text-text-primary text-sm font-bold tracking-tight">
              Nexus Anime
            </span>
          </div>
          <p className="text-text-tertiary text-xs">
            &copy; {currentYear} Nexus Anime. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
