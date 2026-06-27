// @nexus/ui — Input primitive
// Supports text, email, password, search and textarea via the `multiline` prop.
// States: rest, hover, focus, error, disabled (driven by standard HTML attributes).
// Icon slot available via InputIcon wrapper (typically an SVG from lucide-react).

import * as React from "react";

import { cn } from "../lib/cn";

const inputBase = [
  "w-full flex items-center gap-2 rounded-[var(--radius-4)]",
  "bg-void-2 border border-border-default px-3 py-2",
  "text-text-primary placeholder:text-text-placeholder",
  "text-sm leading-none shadow-0",
  "transition-[background-color,border-color,box-shadow] duration-200 ease-spring",
  "hover:border-border-strong",
  "focus-visible:border-border-accent focus-visible:ring-2 focus-visible:ring-aether-4/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base focus-visible:outline-none",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-default",
  "aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/30",
  "[&_svg]:text-text-tertiary [&_svg]:shrink-0 [&_svg]:size-4",
];

const inputVariants = {
  default: "",
  glass: "bg-white/[0.06] border-white/[0.08] backdrop-blur-md hover:bg-white/[0.08]",
} as const;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual variant. @default "default" */
  variant?: keyof typeof inputVariants;
  /** Error message rendered below the input. Drives aria-invalid automatically. */
  error?: string;
  /** Helper text rendered below the input (shown only when no error). */
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", error, helperText, id, ...props }, ref) => {
    const errorId = error ? `${id ?? "input"}-error` : undefined;
    const helperId = helperText && !error ? `${id ?? "input"}-helper` : undefined;
    const describedBy = errorId ?? helperId;

    return (
      <div className="flex flex-col gap-1.5">
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={describedBy}
          className={cn(inputBase, inputVariants[variant], className)}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-error text-xs">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-text-tertiary text-xs">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: keyof typeof inputVariants;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", error, helperText, id, ...props }, ref) => {
    const errorId = error ? `${id ?? "textarea"}-error` : undefined;
    const helperId = helperText && !error ? `${id ?? "textarea"}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={ref}
          id={id}
          rows={4}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={errorId ?? helperId}
          className={cn(
            inputBase,
            "min-h-20 resize-y leading-relaxed",
            inputVariants[variant],
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-error text-xs">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-text-tertiary text-xs">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

/** Wraps an icon to slot into the left of an Input. */
export interface InputIconProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function InputIcon({ className, children, ...props }: InputIconProps) {
  return (
    <span aria-hidden="true" className={cn("-ml-1 mr-1 flex items-center", className)} {...props}>
      {children}
    </span>
  );
}
