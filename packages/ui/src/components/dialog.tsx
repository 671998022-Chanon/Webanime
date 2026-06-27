// @nexus/ui — Dialog primitive (compound)
// Dialog.Root (controlled) + Dialog.Trigger + Dialog.Content + Dialog.Close
// Focus trap, overlay, Esc-to-close, and body scroll lock are provided by Radix.
// Dialog.Content is a client component; Dialog.Root is a client component.

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/* ---------------- Portal / Overlay ---------------- */

export function DialogOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
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

export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Show the close (×) button. @default true */
  showClose?: boolean;
  /** Maximum width. @default "md" */
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showClose = true, size = "md", ...props }, ref) => {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        aria-modal="true"
        className={cn(
          "z-modal fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2",
          "flex flex-col rounded-[var(--radius-5)]",
          "bg-surface-overlay border-border-subtle/40 shadow-4 border",
          "p-6",
          "data-[state=open]:animate-[dialog-enter_250ms_ease-spring]",
          "data-[state=closed]:animate-[dialog-exit_200ms_ease-in]",
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className={cn(
              "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center",
              "text-text-tertiary rounded-[var(--radius-full)]",
              "ease-spring hover:bg-action-ghost-hover hover:text-text-primary transition-colors duration-200",
              "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
            )}
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = "Dialog.Content";

/* ---------------- Header / Body / Footer ---------------- */

const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn("flex shrink-0 flex-col gap-1.5", className)}
      {...props}
    />
  ),
);
Header.displayName = "Dialog.Header";

const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-body"
      className={cn("text-text-primary flex-1 overflow-y-auto py-4", className)}
      {...props}
    />
  ),
);
Body.displayName = "Dialog.Body";

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn("flex shrink-0 items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  ),
);
Footer.displayName = "Dialog.Footer";

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn("text-text-primary text-lg font-semibold", className)}
    {...props}
  />
));
Title.displayName = "Dialog.Title";

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-text-secondary text-sm", className)}
    {...props}
  />
));
Description.displayName = "Dialog.Description";

export const DialogHeader = Header;
export const DialogBody = Body;
export const DialogFooter = Footer;
export const DialogTitle = Title;
export const DialogDescription = Description;
