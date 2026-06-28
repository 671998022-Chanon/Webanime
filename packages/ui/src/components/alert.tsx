// @nexus/ui — Alert primitive (compound)
// Variants: default, success, warning, error, info
// Use for inline status banners, form-level feedback, and section-level notices.
// role="alert" semantics on the root; resolves the correct icon per variant.

import { cva, type VariantProps } from "class-variance-authority";
import { CircleCheck, CircleAlert, CircleX, Info } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

const alertVariants = cva(
  [
    "relative flex w-full items-start gap-3 overflow-hidden rounded-[var(--radius-4)]",
    "border p-4",
    "text-sm leading-relaxed",
    "transition-colors duration-200 ease-spring",
  ],
  {
    variants: {
      variant: {
        default: "bg-surface-overlay border-border-subtle/40 text-text-primary",
        success: "bg-success-muted/30 border-success/40 text-success",
        warning: "bg-warning-muted/30 border-warning/40 text-warning",
        error: "bg-error-muted/30 border-error/40 text-error",
        info: "bg-aether-4/15 border-aether-4/30 text-aether-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconMap = {
  default: null,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleX,
  info: Info,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  const Icon = iconMap[variant ?? "default"];
  return (
    <div
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {Icon ? <AlertIcon variant={variant} className="mt-0.5 shrink-0" /> : null}
      <div className="flex-1">{props.children}</div>
    </div>
  );
}

/* ---------------- Icon ---------------- */

export interface AlertIconProps
  extends
    Omit<React.SVGAttributes<SVGSVGElement>, "children">,
    VariantProps<typeof alertVariants> {}

export function AlertIcon({ className, variant, ...props }: AlertIconProps) {
  const Icon = iconMap[variant ?? "default"];
  if (!Icon) return null;
  return (
    <Icon
      aria-hidden="true"
      data-slot="alert-icon"
      className={cn("size-4 shrink-0", className)}
      {...props}
    />
  );
}

AlertIcon.displayName = "Alert.Icon";

/* ---------------- Title ---------------- */

export interface AlertTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <p
      data-slot="alert-title"
      className={cn("text-sm font-medium leading-none text-inherit", className)}
      {...props}
    />
  );
}

AlertTitle.displayName = "Alert.Title";

/* ---------------- Description ---------------- */

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-text-secondary text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

AlertDescription.displayName = "Alert.Description";
