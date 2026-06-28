import { Container, Button, Input } from "@nexus/ui";
import Link from "next/link";

/**
 * 404 Not Found page. Shows illustration, message, search bar, and
 * navigation CTAs. Server Component.
 */
export default function NotFound() {
  return (
    <main id="main-content" className="flex-1">
      <Container size="md" className="flex min-h-[70vh] items-center justify-center py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* 404 illustration — drifting character in void */}
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            aria-hidden="true"
            className="text-text-tertiary/20 shrink-0"
          >
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            <circle
              cx="80"
              cy="80"
              r="40"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x="80"
              y="72"
              textAnchor="middle"
              className="fill-text-tertiary/40 font-display"
              fontSize="32"
              fontWeight="bold"
            >
              404
            </text>
            <text x="80" y="96" textAnchor="middle" className="fill-text-tertiary/30" fontSize="10">
              NOT FOUND
            </text>
          </svg>

          <h1 className="font-display text-text-primary text-3xl font-bold">Page not found</h1>
          <p className="text-text-secondary max-w-md text-sm">
            The page you are looking for does not exist or has been moved. Try searching or head
            back to the home page.
          </p>

          {/* Search bar */}
          <div className="w-full max-w-sm">
            <Input type="search" placeholder="Search anime..." aria-label="Search anime" />
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Button variant="primary" asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/browse">Browse anime</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
