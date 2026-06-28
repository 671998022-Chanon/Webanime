// @nexus/ui — Toaster primitive (convenience wrapper)
// Wraps ToastProvider + ToastViewport with design-system defaults.
// Drop into the app root once; any descendant <Toast.Root> renders into it.
//
// Example:
//   // app/layout.tsx
//   import { Toaster } from "@nexus/ui";
//   export default function RootLayout({ children }) {
//     return (
//       <html>
//         <body>{children}<Toaster /></body>
//       </html>
//     );
//   }
//
//   // any descendant
//   import { ToastRoot, ToastTitle, ToastDescription } from "@nexus/ui";
//   <ToastRoot variant="success">
//     <ToastTitle>Saved</ToastTitle>
//     <ToastDescription>Your changes have been saved.</ToastDescription>
//   </ToastRoot>

"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import * as React from "react";

import { ToastViewport } from "./toast";

export type ToasterProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Provider>;

export function Toaster({ children, ...props }: ToasterProps) {
  return (
    <ToastPrimitives.Provider duration={5000} {...props}>
      <ToastViewport />
      {children}
    </ToastPrimitives.Provider>
  );
}

Toaster.displayName = "Toaster";
