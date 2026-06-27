// @nexus/ui — Typography primitive
// Polymorphic text component that maps to the design type scale.
// Applies font family, size, weight, line-height, and tracking from tokens.

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const typographyVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs leading-[1.45] tracking-wide",
      sm: "text-sm leading-[1.5] tracking-wide",
      base: "text-base leading-[1.5] tracking-normal",
      md: "text-md leading-[1.5] tracking-normal",
      lg: "text-lg leading-[1.4] tracking-normal",
      xl: "text-xl leading-[1.35] tracking-normal font-display",
      "2xl": "text-2xl leading-[1.3] tracking-normal font-display",
      "3xl": "text-3xl leading-[1.25] tracking-tight font-display",
      "4xl": "text-4xl leading-[1.2] tracking-tight font-display",
      "5xl": "text-5xl leading-[1.15] tracking-tight font-display",
      "6xl": "text-6xl leading-[1.1] tracking-tight font-display",
    },
    font: {
      body: "font-body",
      display: "font-display",
    },
    weight: {
      light: "font-light",
      regular: "font-regular",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    tracking: {
      tight: "tracking-tight",
      normal: "tracking-normal",
      wide: "tracking-wide",
      wider: "tracking-wider",
      widest: "tracking-widest",
    },
  },
  compoundVariants: [
    /* Enforce display font at sizes >= xl even if font="body" was chosen */
    { size: "xl", class: "font-display" },
    { size: "2xl", class: "font-display" },
    { size: "3xl", class: "font-display" },
    { size: "4xl", class: "font-display" },
    { size: "5xl", class: "font-display" },
    { size: "6xl", class: "font-display" },
  ],
  defaultVariants: {
    size: "base",
    font: "body",
    weight: "regular",
    tracking: "normal",
  },
});

const ELEMENT_MAP = {
  p: "p",
  span: "span",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  label: "label",
  div: "div",
} as const;

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  /** HTML element to render. @default "p" */
  element?: keyof typeof ELEMENT_MAP;
  /** Use Slot to merge props onto a child element. */
  asChild?: boolean;
}

export function Typography({
  className,
  element: Element = "p",
  size,
  font,
  weight,
  tracking,
  asChild = false,
  children,
  ...props
}: TypographyProps) {
  const classes = cn(typographyVariants({ size, font, weight, tracking }), className);

  if (asChild) {
    return (
      <Slot className={classes} {...(props as React.ComponentPropsWithoutRef<typeof Slot>)}>
        {children}
      </Slot>
    );
  }

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
}
