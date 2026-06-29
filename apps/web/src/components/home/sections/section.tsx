// Shared primitives for homepage placeholder sections (Task 14.1).
// These are intentionally lightweight — they provide consistent spacing,
// typography rhythm, and visible placeholder containers for the six
// home-page sections. They will be replaced by real section implementations
// in Task 14.2+ and should not be treated as reusable components outside
// this milestone.

import { Container, Typography } from "@nexus/ui";

interface SectionShellProps {
  /** Visible heading text. */
  title: string;
  /** ID used for `aria-labelledby` on the section element. Should be kebab-case. */
  id: string;
  /** Optional content rendered below the heading — typically an empty-state placeholder. */
  children?: React.ReactNode;

  /** When false, the section is not rendered (e.g. Continue Watching hidden
   *  for users with no watch history). Defaults to true. */
  visible?: boolean;
}

/**
 * consistent section wrapper for homepage rails.semantic <section> with
 * aria-labelledby linking to the heading; uses Container's 2xl max-width and
 * responsive padding.
 */
export function SectionShell({ title, id, children, visible = true }: SectionShellProps) {
  if (!visible) return null;

  const headingId = `home-${id}-heading`;

  return (
    <section
      id={`home-${id}`}
      aria-labelledby={headingId}
      data-slot={`section-${id}`}
      className="w-full"
    >
      <Container size="full" className="px-0">
        <header className="mb-4 flex items-end justify-between gap-4 md:mb-6">
          <Typography
            element="h2"
            id={headingId}
            size="xl"
            weight="semibold"
            className="text-text-primary"
          >
            {title}
          </Typography>
          {/* "See all →" placeholder — purely visual until the rail is wired up.
              Hidden from the accessibility tree; the real control replaces it. */}
          <span
            aria-hidden="true"
            className="text-text-tertiary hover:text-text-secondary hidden cursor-pointer text-sm font-medium transition-colors duration-150 sm:inline"
          >
            See all →
          </span>
        </header>
        {children}
      </Container>
    </section>
  );
}

/**
 * Dashed-border box indicating "content goes here". Shared by every
 * placeholder section so visually they look consistently unfinished.
 */
export function PlaceholderContent({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="presentation"
      className={`border-border-subtle/50 bg-surface-sunken/30 text-text-tertiary flex min-h-32 items-center justify-center rounded-[var(--radius-4)] border border-dashed p-6 text-sm md:min-h-40 ${className ?? ""} `.trim()}
    >
      {label}
    </div>
  );
}
