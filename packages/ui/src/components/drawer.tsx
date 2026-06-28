// @nexus/ui — Drawer primitive (compound)
// Wraps @radix-ui/react-dialog with directional slide-from-edge animations.
// Supports top / right / bottom / left directions. Default: right.
// Focus trap, Esc-to-close, body scroll lock provided by Radix.

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

/* ---------------- Overlay ---------------- */

export function DrawerOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="drawer-overlay"
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

export type DrawerDirection = "top" | "right" | "bottom" | "left";

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Slide-in direction. @default "right" */
  direction?: DrawerDirection;
}

const directionClasses: Record<DrawerDirection, string> = {
  top: "inset-x-0 top-0 max-h-[80vh] rounded-b-[var(--radius-5)]",
  right: "inset-y-0 right-0 max-w-md rounded-l-[var(--radius-5)]",
  bottom: "inset-x-0 bottom-0 max-h-[80vh] rounded-t-[var(--radius-5)]",
  left: "inset-y-0 left-0 max-w-md rounded-r-[var(--radius-5)]",
};

const directionEnterAnimations: Record<DrawerDirection, string> = {
  top: "animate-[drawer-slide-from-top_300ms_ease-spring]",
  right: "animate-[drawer-slide-from-right_300ms_ease-spring]",
  bottom: "animate-[drawer-slide-from-bottom_300ms_ease-spring]",
  left: "animate-[drawer-slide-from-left_300ms_ease-spring]",
};

const directionExitAnimations: Record<DrawerDirection, string> = {
  top: "animate-[drawer-slide-to-top_250ms_ease-in]",
  right: "animate-[drawer-slide-to-right_250ms_ease-in]",
  bottom: "animate-[drawer-slide-to-bottom_250ms_ease-in]",
  left: "animate-[drawer-slide-to-left_250ms_ease-in]",
};

export const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, direction = "right", ...props }, ref) => {
  return (
    <DialogPrimitive.Portal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="drawer-content"
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
          aria-label="Close drawer"
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
DrawerContent.displayName = "Drawer.Content";

/* ---------------- Header / Body / Footer ---------------- */

const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="drawer-header"
      className={cn("flex shrink-0 flex-col gap-1.5", className)}
      {...props}
    />
  ),
);
Header.displayName = "Drawer.Header";

const Body = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="drawer-body"
      className={cn("text-text-primary flex-1 overflow-y-auto py-4", className)}
      {...props}
    />
  ),
);
Body.displayName = "Drawer.Body";

const Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="drawer-footer"
      className={cn("flex shrink-0 items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  ),
);
Footer.displayName = "Drawer.Footer";

/* ---------------- Title / Description ---------------- */

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="drawer-title"
    className={cn("text-text-primary text-lg font-semibold", className)}
    {...props}
  />
));
Title.displayName = "Drawer.Title";

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="drawer-description"
    className={cn("text-text-secondary text-sm", className)}
    {...props}
  />
));
Description.displayName = "Drawer.Description";

export const DrawerHeader = Header;
export const DrawerBody = Body;
export const DrawerFooter = Footer;
export const DrawerTitle = Title;
export const DrawerDescription = Description;
