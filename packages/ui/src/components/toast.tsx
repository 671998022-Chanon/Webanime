// @nexus/ui — Toast primitive (compound)
// Wraps @radix-ui/react-toast. Variants: default, success, warning, error, info.
// Auto-dismiss via duration prop. Action slot for undo/close.

"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const ToastProvider = ToastPrimitives.Provider;
export const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    data-slot="toast-viewport"
    className={cn(
      "z-modal fixed right-0 top-0 flex w-full max-w-sm flex-col gap-2 p-4",
      "outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "Toast.Viewport";

/* ---------------- Root ---------------- */

export interface ToastRootProps extends React.ComponentPropsWithoutRef<
  typeof ToastPrimitives.Root
> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  /** Auto-dismiss duration in ms. @default 5000 */
  duration?: number;
}

const variantClasses = {
  default: "bg-surface-overlay border-border-subtle/40 text-text-primary",
  success: "bg-success-muted/30 border-success/40 text-success",
  warning: "bg-warning-muted/30 border-warning/40 text-warning",
  error: "bg-error-muted/30 border-error/40 text-error",
  info: "bg-aether-4/15 border-aether-4/30 text-aether-6",
} as const;

export const ToastRoot = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Root>,
  ToastRootProps
>(({ className, variant = "default", duration = 5000, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      type="foreground"
      duration={duration}
      data-slot="toast"
      data-variant={variant}
      className={cn(
        "group relative flex items-start gap-3 overflow-hidden rounded-[var(--radius-4)]",
        "shadow-2 border p-4 pr-8",
        "data-[state=open]:animate-[toast-enter_250ms_ease-spring]",
        "data-[state=closed]:animate-[toast-exit_200ms_ease-in]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
ToastRoot.displayName = "Toast.Root";

/* ---------------- Title / Description ---------------- */

export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    data-slot="toast-title"
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
));
ToastTitle.displayName = "Toast.Title";

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    data-slot="toast-description"
    className={cn("text-text-secondary text-xs", className)}
    {...props}
  />
));
ToastDescription.displayName = "Toast.Description";

/* ---------------- Close ---------------- */

export const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    aria-label="Close notification"
    data-slot="toast-close"
    className={cn(
      "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center",
      "text-text-tertiary rounded-[var(--radius-full)]",
      "ease-spring hover:bg-action-ghost-hover hover:text-text-primary transition-colors duration-200",
      "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="size-3.5" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = "Toast.Close";

/* ---------------- Action ---------------- */

export const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    data-slot="toast-action"
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-[var(--radius-2)]",
      "bg-void-2 text-text-primary px-2.5 text-xs font-medium",
      "ease-spring hover:bg-void-3 transition-colors duration-200",
      "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = "Toast.Action";
