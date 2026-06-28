// @nexus/ui — StatCard composite
// Composes Card for dashboard-style stat display.
// Generic — accepts icon, label, value, and optional trend.
// No data fetching. Pure presentational.

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

import { Card } from "./card";

import type { LucideIcon } from "lucide-react";

type TrendDirection = "up" | "down" | "flat";

export interface StatCardProps {
  /** Lucide icon component (rendered at 20px). */
  icon: LucideIcon;
  /** Stat label e.g. "Total Watched". */
  label: string;
  /** Formatted value e.g. "1,234". */
  value: string;
  /** Optional trend direction. */
  trend?: TrendDirection;
  /** Optional trend value e.g. "+12%". Rendered next to the trend icon. */
  trendValue?: string;
  /** Optional className for the root card. */
  className?: string;
}

const trendStyles: Record<TrendDirection, { icon: LucideIcon; classes: string }> = {
  up: { icon: TrendingUp, classes: "text-success" },
  down: { icon: TrendingDown, classes: "text-error" },
  flat: { icon: Minus, classes: "text-text-secondary" },
};

export const StatCard = React.forwardRef<HTMLElement, StatCardProps>(function StatCard(
  { icon: Icon, label, value, trend, trendValue, className },
  ref,
) {
  const trendMeta = trend ? trendStyles[trend] : null;
  const TrendIcon = trendMeta?.icon;

  return (
    <Card ref={ref} variant="glass" data-slot="stat-card" className={cn("w-full", className)}>
      <Card.Body className="flex items-start gap-4 p-5">
        <div className="bg-aether-4/15 text-aether-7 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-4)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className="text-text-primary text-2xl font-semibold leading-none">{value}</p>
          {trendMeta && TrendIcon && (
            <div
              className={cn("flex items-center gap-1 text-xs font-medium", trendMeta.classes)}
              aria-label={`Trend: ${trend}`}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
});

StatCard.displayName = "StatCard";
