import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  className,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const describedBy = error
    ? `${inputId}-error`
    : helperText
      ? `${inputId}-helper`
      : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="font-body text-sm font-medium text-text-primary">
          {label}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 text-text-muted" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-border-subtle bg-void-elevated px-3 font-body text-sm text-text-primary",
            "placeholder:text-text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-resonance focus-visible:ring-offset-2 focus-visible:ring-offset-void-base",
            "disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {rightIcon ? (
          <span
            className="pointer-events-none absolute right-3 text-text-muted"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="font-body text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="font-body text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
