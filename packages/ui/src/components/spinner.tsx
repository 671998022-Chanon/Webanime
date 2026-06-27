// @nexus/ui — Spinner primitive
// Used by Button (loading state) and as a standalone indicator.
// Respects prefers-reduced-motion: no visual animation, just a static indicator.

import * as React from "react";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** Visual size. Maps to pixel dimension. @default 16 */
  size?: number;
  /** Accessible label. @default "Loading" */
  label?: string;
}

export function Spinner({ size = 16, label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" className="origin-center animate-spin" />
    </svg>
  );
}
