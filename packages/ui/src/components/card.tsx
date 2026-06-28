// @nexus/ui — Card primitive (compound)
// Card.Root > Card.Header + Card.Body + Card.Footer
// Variants: default, glass, compact, featured
// Polymorphic root: article (default), a (clickable), div (layout-only)

import * as React from "react";

import { cn } from "../lib/cn";

type CardElement = "article" | "a" | "div";

const cardVariants = {
  default: ["bg-surface-raised border border-border-subtle/40", "shadow-0"],
  glass: ["bg-white/[0.06] backdrop-blur-md border border-white/[0.08]", "shadow-1"],
  compact: ["bg-transparent border-none shadow-0"],
  featured: ["bg-aether-4/[0.06] backdrop-blur-md border border-aether-4/20", "shadow-1"],
} as const;

const hoverByVariant: Record<string, string> = {
  default: "hover:border-border-subtle/70 hover:shadow-1 hover:-translate-y-0.5",
  glass: "hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-2 hover:-translate-y-0.5",
  featured:
    "hover:bg-aether-4/[0.08] hover:border-aether-4/30 hover:shadow-2 hover:-translate-y-0.5",
};

export interface CardRootProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof cardVariants;
  /** Render as a different element. @default "article" */
  as?: CardElement;
  /** When true, the card is interactive (hover effects apply). */
  interactive?: boolean;
}

function CardRootImpl(
  { variant = "default", as = "article", interactive = false, className, ...props }: CardRootProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const classes = cn(
    "relative flex flex-col rounded-[var(--radius-5)] overflow-hidden",
    "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-spring",
    cardVariants[variant],
    interactive && hoverByVariant[variant],
    className,
  );

  // Callback ref keeps the polymorphic cast contained — consumers see HTMLElement.

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  if (as === "article") {
    return (
      <article
        ref={setRef}
        data-slot="card"
        data-variant={variant}
        className={classes}
        {...props}
      />
    );
  }
  if (as === "a") {
    return (
      <a ref={setRef} data-slot="card" data-variant={variant} className={classes} {...props} />
    );
  }
  return (
    <div ref={setRef} data-slot="card" data-variant={variant} className={classes} {...props} />
  );
}

const CardRoot = React.forwardRef<HTMLElement, CardRootProps>(CardRootImpl);
CardRoot.displayName = "Card.Root";

export interface CardSubProps extends React.HTMLAttributes<HTMLDivElement> {}

function slot(displayName: string, baseClasses: string) {
  const Inner = React.forwardRef<HTMLDivElement, CardSubProps>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(baseClasses, className)} {...props} />
  ));
  Inner.displayName = displayName;
  return Inner;
}

const CardHeader = slot("Card.Header", "flex flex-col gap-2 p-4 pb-0");
const CardBody = slot("Card.Body", "flex flex-col gap-3 p-4");
const CardFooter = slot("Card.Footer", "flex items-center gap-2 p-4 pt-0 mt-auto");

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
