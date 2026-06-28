// @nexus/ui — Sheet primitive (compound)
// Semantically distinct from Drawer but structurally identical.
// Optimized for bottom-sheet (mobile) and side-panel (desktop) use cases.
// Supports top / right / bottom / left directions. @default "bottom".

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

/* ---------------- Overlay ---------------- */

export function SheetOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
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

export type SheetDirection = "top" | "right" | "bottom" | "left";

export interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Slide-in direction. @default "bottom" */
  direction?: SheetDirection;
}

const directionClasses: Record<SheetDirection, string> = {
  top: "inset-x-0 top-0 max-h-[80vh] rounded-b-[var(--radius-5)]",
  right: "inset-y-0 right-0 max-w-md rounded-l-[var(--radius-5)]",
  bottom: "inset-x-0 bottom-0 max-h-[80vh] rounded-t-[var(--radius-5)]",
  left: "inset-y-0 left-0 max-w-md rounded-r-[var(--radius-5)]",
};

const directionEnterAnimations: Record<SheetDirection, string> = {
  top: "animate-[drawer-slide-from-top_300ms_ease-spring]",
  right: "animate-[drawer-slide-from-right_300ms_ease-spring]",
  bottom: "animate-[drawer-slide-from-bottom_300ms_ease-spring]",
  left: "animate-[drawer-slide-from-left_300ms_ease-spring]",
};

const directionExitAnimations: Record<SheetDirection, string> = {
  top: "animate-[drawer-slide-to-top_250ms_ease-in]",
  right: "animate-[drawer-slide-to-right_250ms_ease-in]",
  bottom: "animate-[drawer-slide-to-bottom_250ms_ease-in]",
  left: "animate-[drawer-slide-to-left_250ms_ease-in]",
};

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, direction = "bottom", ...props }, ref) => {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        data-direction={direction}
        aria-modal="true"
        className={cn(
          "z-modal fixed flex flex-col",
          "bg-surface-overlay border-border-subtle/40 shadow-4 border",
          "overflow-y-auto p-6",
          directionClasses[direction],
          directionEnterAnimations[direction],
          directionExitAnimations[direction],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close sheet"
          className={cn(
            "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center",
            "text-text-tertiary rounded-[var(--radius-full)]",
            "ease-spring hover:bg-action-ghost-hover hover:text-text-primary transition-colors duration-200",
            "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
          )}
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = "Sheet.Content";

/* ---------------- Header / Body / Footer ---------------- */

const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col gap-1.5", className)}
      {...props}
    />
  ),
);
Header.displayName = "Sheet.Header";

const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-body"
      className={cn("text-text-primary flex-1 overflow-y-auto py-4", className)}
      {...props}
    />
  ),
);
Body.displayName = "Sheet.Body";

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn("flex shrink-0 items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  ),
);
Footer.displayName = "Sheet.Footer";

/* ---------------- Title / Description ---------------- */

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="sheet-title"
    className={cn("text-text-primary text-lg font-semibold", className)}
    {...props}
  />
));
Title.displayName = "Sheet.Title";

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="sheet-description"
    className={cn("text-text-secondary text-sm", className)}
    {...props}
  />
));
Description.displayName = "Sheet.Description";

export const SheetHeader = Header;
export const SheetBody = Body;
export const SheetFooter = Footer;
export const SheetTitle = Title;
export const SheetDescription = Description;
