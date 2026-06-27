// @nexus/ui — Avatar primitive (compound)
// Avatar.Root > Avatar.Image + Avatar.Fallback
// Sizes: xs, sm, md (default), lg, xl

import * as React from "react";

import { cn } from "../lib/cn";

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

export interface AvatarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual size. @default "md" */
  size?: keyof typeof sizeMap;
}

const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarRootProps>(
  ({ size = "md", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="avatar"
        data-size={size}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[var(--radius-full)]",
          "bg-void-3",
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AvatarRoot.displayName = "Avatar.Root";

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        data-slot="avatar-image"
        className={cn("h-full w-full object-cover", className)}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = "Avatar.Image";

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="avatar-fallback"
        role="img"
        className={cn(
          "flex h-full w-full items-center justify-center rounded-[var(--radius-full)]",
          "bg-aether-4/20 text-aether-7 font-medium leading-none",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AvatarFallback.displayName = "Avatar.Fallback";

export const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
