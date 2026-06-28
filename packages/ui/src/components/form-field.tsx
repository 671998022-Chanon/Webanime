// @nexus/ui — FormField
// Ties a Label + control + FormMessage + FormDescription together via a stable id.
//
// Usage:
//   <FormField name="email" label="Email" error={errors.email?.message} required>
//     <Input type="email" />
//     <FormDescription>We'll never share your email.</FormDescription>
//   </FormField>
//
// FormField auto-generates a unique id, renders the label and auto-renders the
// error/hint when the `error`/`helperText` props are provided. The consumer is
// responsible for forwarding the id to the control, or using the `render` prop
// for auto-wiring.
//
//   <FormField name="email" label="Email" error={errors.email?.message}>
//     {({ inputId, describedBy }) => (
//       <Input id={inputId} aria-describedby={describedBy} type="email" />
//     )}
//   </FormField>

import * as React from "react";

import { cn } from "../lib/cn";

import { FormDescription } from "./form-description";
import { FormMessage } from "./form-message";

export interface RenderFieldProps {
  /** The id that the control should use for id and label htmlFor. */
  inputId: string;
  /** The value to spread onto the control as aria-describedby. */
  describedBy: string | undefined;
}

export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Field name — used to derive a stable id. Must be unique per form. */
  name: string;
  /** Visible label text rendered above the control. */
  label?: React.ReactNode;
  /** Error message rendered via <FormMessage variant="destructive">. */
  error?: string;
  /** Long-form hint rendered via <FormDescription>. */
  helperText?: string;
  /** Marks the field as required. */
  required?: boolean;
  /** Static children rendered between the label and the hint/error. */
  children?: React.ReactNode;
  /** Render prop that receives the auto-generated ids for wiring to a control. */
  render?: (props: RenderFieldProps) => React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { className, name, label, error, helperText, required = false, children, render, id, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;
    const fieldAtom = { inputId, describedBy, required };

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-text-primary flex items-center gap-1 text-sm font-medium"
          >
            {label}
            {required ? (
              <span aria-hidden="true" className="text-error">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        {render ? render(fieldAtom) : null}
        {children}
        {error ? (
          <FormMessage id={errorId} variant="destructive">
            {error}
          </FormMessage>
        ) : helperText ? (
          <FormDescription id={helperId}>{helperText}</FormDescription>
        ) : null}
      </div>
    );
  },
);
FormField.displayName = "FormField";
