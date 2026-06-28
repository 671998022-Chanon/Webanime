// @nexus/ui — AlertDialog primitive (compound)
// Wraps @radix-ui/react-alert-dialog. Modal semantics with design-system styling.
// Focus trap, Esc-to-close, body scroll lock provided by Radix.

"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/* ---------------- Overlay ---------------- */

export function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "z-overlay fixed inset-0",
        "bg-void-1/80 backdrop-blur-sm",
        "data-[state=open]:animate-[dialog-fade-in_200ms_ease-out]",
        "data-[state=closed]:animate-[dialog-fade-out_150ms_ease-in]",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Content ---------------- */

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
> {}

export const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        data-slot="alert-dialog-content"
        aria-modal="true"
        role="alertdialog"
        className={cn(
          "z-modal fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2",
          "flex flex-col rounded-[var(--radius-5)]",
          "bg-surface-overlay border-border-subtle/40 shadow-4 border p-6",
          "max-w-sm",
          "data-[state=open]:animate-[dialog-enter_250ms_ease-spring]",
          "data-[state=closed]:animate-[dialog-exit_200ms_ease-in]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className={cn(
            "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center",
            "text-text-tertiary rounded-[var(--radius-full)]",
            "ease-spring hover:bg-action-ghost-hover hover:text-text-primary transition-colors duration-200",
            "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
          )}
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
});
AlertDialogContent.displayName = "AlertDialog.Content";

/* ---------------- Header / Body / Footer ---------------- */

const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-dialog-header"
      className={cn("flex shrink-0 flex-col gap-1.5", className)}
      {...props}
    />
  ),
);
Header.displayName = "AlertDialog.Header";

const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-dialog-body"
      className={cn("text-text-primary flex-1 overflow-y-auto py-4", className)}
      {...props}
    />
  ),
);
Body.displayName = "AlertDialog.Body";

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-dialog-footer"
      className={cn("flex shrink-0 items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  ),
);
Footer.displayName = "AlertDialog.Footer";

/* ---------------- Title / Description ---------------- */

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn("text-text-primary text-lg font-semibold", className)}
    {...props}
  />
));
Title.displayName = "AlertDialog.Title";

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn("text-text-secondary text-sm", className)}
    {...props}
  />
));
Description.displayName = "AlertDialog.Description";

/* ---------------- Action / Cancel ---------------- */

export interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Action
> {}

export const AlertDialogAction = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Action>,
  AlertDialogActionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    data-slot="alert-dialog-action"
    className={cn("", className)}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialog.Action";

export interface AlertDialogCancelProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Cancel
> {}

export const AlertDialogCancel = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
  AlertDialogCancelProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    data-slot="alert-dialog-cancel"
    className={cn("", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialog.Cancel";

export const AlertDialogHeader = Header;
export const AlertDialogBody = Body;
export const AlertDialogFooter = Footer;
export const AlertDialogTitle = Title;
export const AlertDialogDescription = Description;
