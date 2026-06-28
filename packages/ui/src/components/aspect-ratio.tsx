// @nexus/ui — AspectRatio primitive (Radix-based)
// Wraps @radix-ui/react-aspect-ratio with design-system className merge

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import * as React from "react";

import { cn } from "../lib/cn";

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    ref={ref}
    data-slot="aspect-ratio"
    className={cn("relative", className)}
    {...props}
  />
));
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
