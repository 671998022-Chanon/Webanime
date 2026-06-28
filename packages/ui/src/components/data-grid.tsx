// @nexus/ui — DataGrid foundation
// Generic responsive grid layout. No data fetching.
// Renders children in a responsive column grid with configurable breakpoints.

import * as React from "react";

import { cn } from "../lib/cn";

type Columns = 1 | 2 | 3 | 4 | 5 | 6;

export interface DataGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns at each breakpoint. */
  columns?: {
    base?: Columns;
    sm?: Columns;
    md?: Columns;
    lg?: Columns;
    xl?: Columns;
  };
  /** Gap between grid items. @default "md" */
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

const columnMap = {
  base: {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  },
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  },
} satisfies Record<string, Record<Columns, string>>;

const gapMap = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

export function DataGrid({
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  className,
  ...props
}: DataGridProps) {
  const colClasses = [
    columnMap.base[columns.base ?? 1],
    columns.sm && columnMap.sm[columns.sm],
    columns.md && columnMap.md[columns.md],
    columns.lg && columnMap.lg[columns.lg],
    columns.xl && columnMap.xl[columns.xl],
  ].filter(Boolean);

  return (
    <div
      data-slot="data-grid"
      className={cn("grid", gapMap[gap], ...colClasses, className)}
      {...props}
    />
  );
}

const DataGridItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="data-grid-item" className={cn("min-w-0", className)} {...props} />
  ),
);
DataGridItem.displayName = "DataGrid.Item";

export { DataGridItem };
