import { Container, Separator, Typography } from "@nexus/ui";
import Link from "next/link";

/**
 * Footer navigation sections — canonical four-column layout.
 *
 * Routes are placeholders until the corresponding pages are implemented
 * in future milestones. Link labels and structure follow `docs/05-ui/Navigation.md` §9.
 */
const FOOTER_SECTIONS = [
  {
    title: "Browse",
    links: [
      { href: "/", label: "Home" },
      { href: "/trending", label: "Trending" },
      { href: "/latest", label: "Latest" },
      { href: "/genres", label: "Genres" },
    ],
  },
  {
    title: "Library",
    links: [
      { href: "/continue-watching", label: "Continue Watching" },
      { href: "/watchlist", label: "Watchlist" },
      { href: "/history", label: "History" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help Center" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
] as const;

/**
 * Social media placeholder links — no real accounts yet.
 * Each link renders an inline SVG icon in a glassmorphic tile.
 * Replace `href` values with real URLs when accounts are established.
 */
const SOCIAL_LINKS = [
  {
    href: "#",
    label: "Discord",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
        <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.07.034c-.21.376-.444.866-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.59 12.59 0 0 0-.617-1.249.07.07 0 0 0-.07-.034 19.74 19.74 0 0 0-4.885 1.515.06.06 0 0 0-.03.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.07.07 0 0 0 .076-.024c.462-.63.874-1.295 1.226-1.994a.07.07 0 0 0-.038-.099 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.118c.126-.094.252-.192.372-.291a.07.07 0 0 1 .072-.01c3.928 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .073.009c.12.099.246.198.372.292a.07.07 0 0 1-.006.118c-.598.348-1.221.642-1.873.891a.07.07 0 0 0-.038.1c.36.699.772 1.363 1.225 1.993a.07.07 0 0 0 .077.025 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.03-.028zM8.02 15.33c-1.182 0-2.156-1.085-2.156-2.418 0-1.333.955-2.419 2.156-2.419 1.21 0 2.175 1.096 2.156 2.42 0 1.332-.955 2.418-2.156 2.418zm7.974 0c-1.182 0-2.156-1.085-2.156-2.418 0-1.333.955-2.419 2.156-2.419 1.21 0 2.175 1.096 2.156 2.42 0 1.332-.946 2.418-2.156 2.418z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "X (Twitter)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
] as const;

/**
 * Global footer — four desktop columns, two mobile columns.
 *
 * Sections (defined above): Browse, Library, Support, Legal.
 * Bottom row: copyright, version placeholder, build placeholder.
 * Social row: Discord, GitHub, X, YouTube — placeholder links (href="#").
 *
 * Glassmorphic treatment: `bg-surface-sunken/60 backdrop-blur-sm` with a
 * subtle top border. The footer sits at the bottom of a flex column
 * (`mt-auto`); the parent (`app-shell.tsx`) ensures it sticks when
 * content is short.
 *
 * Server Component — no hooks, no state. The current year is computed
 * at render time.
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
        <nav aria-label="Footer navigation">
          <div className="grid grid-cols-2 gap-6 gap-y-10 md:grid-cols-4">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <Typography element="h3" size="sm" weight="semibold" className="text-text-primary">
                  {section.title}
                </Typography>
                <ul className="mt-4 flex flex-col gap-2.5">
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
        </nav>

        <Separator orientation="horizontal" className="my-10" />

        {/* Social icons row */}
        <nav aria-label="Social media">
          <ul className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  className="border-border-subtle/40 bg-surface-raised/50 text-text-tertiary hover:text-text-primary hover:border-border-default focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base ease-spring flex size-9 items-center justify-center rounded-[var(--radius-2)] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom bar */}
        <div className="border-border-subtle/40 mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
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

          <p className="text-text-placeholder text-xs" aria-label="Version and build">
            <span aria-hidden="true">v0.3.0</span>
            <span aria-hidden="true" className="mx-2">
              ·
            </span>
            <span aria-hidden="true">Application Shell · 2026.06.29</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
