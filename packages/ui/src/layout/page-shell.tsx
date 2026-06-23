import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function PageShell({ children, header, footer, className, ...props }: PageShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-void-base text-text-primary", className)} {...props}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-resonance focus:px-4 focus:py-2 focus:text-void-base"
      >
        Skip to main content
      </a>
      {header}
      <main id="main-content" className="mx-auto w-full max-w-container flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
      {footer}
    </div>
  );
}
