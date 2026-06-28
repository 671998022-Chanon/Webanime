// @nexus/ui — PasswordInput
// Wraps Input with a show/hide toggle. Controlled via useState.
// Toggle button is accessible: aria-pressed + aria-label, focus-visible ring.

"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

import { Input, type InputProps } from "./input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = React.useState(false);

    const onToggle = () => setVisible((v) => !v);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          {...props}
          className={cn("pr-11", props.className)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "flex h-7 w-7 items-center justify-center rounded-[var(--radius-2)]",
            "text-text-tertiary hover:text-text-primary",
            "ease-spring transition-colors duration-150",
            "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          )}
        >
          {visible ? (
            <EyeOff className="pointer-events-none size-4" />
          ) : (
            <Eye className="pointer-events-none size-4" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
