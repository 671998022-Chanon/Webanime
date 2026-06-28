// @nexus/ui — Combobox (headless)
// A filterable list — the right primitive for the Search page (Search.md spec).
//
// Headless (no Radix): the search spec calls for role="combobox" + aria-activedescendant
// + aria-live result count. A full Radix Combobox is overkill; this exposes the same
// accessibility surface with a simple useState-driven flow.
//
// Pass `value`, `onValueChange`, and `options`. Filtering is case-insensitive substring
// match; override `filterFn` for custom filtering.

"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current selected value. Pass "" for unselected. */
  value: string;
  /** Fires when the user selects a value (click, Enter). */
  onValueChange: (value: string) => void;
  /** Option list. */
  options: ComboboxOption[];
  /** Placeholder text when nothing is selected. */
  placeholder?: string;
  /** Message shown when the filter returns no results. @default "No results" */
  emptyMessage?: string;
  /** Disable the control. */
  disabled?: boolean;
  /** Custom filter. Default: case-insensitive substring match on label. */
  filterFn?: (query: string, option: ComboboxOption) => boolean;
  /** Class name for the popover list. */
  popoverClassName?: string;
}

const defaultFilter = (q: string, opt: ComboboxOption) =>
  opt.label.toLowerCase().includes(q.toLowerCase());

export const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      className,
      value,
      onValueChange,
      options,
      placeholder = "Select…",
      emptyMessage = "No results",
      disabled,
      filterFn = defaultFilter,
      popoverClassName,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [highlight, setHighlight] = React.useState(0);
    const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);

    const listboxId = React.useId();
    const liveRegionId = React.useId();
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Keep selected label in sync with value prop
    React.useEffect(() => {
      if (value) {
        const found = options.find((o) => o.value === value);
        setSelectedLabel(found?.label ?? null);
      } else {
        setSelectedLabel(null);
      }
    }, [value, options]);

    // Reset highlight when open state or options change
    React.useEffect(() => {
      setHighlight(0);
    }, [open, options]);

    // Click-outside handling
    React.useEffect(() => {
      if (!open) return;
      const onPointer = (e: PointerEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("pointerdown", onPointer);
      return () => document.removeEventListener("pointerdown", onPointer);
    }, [open]);

    const filtered = query ? options.filter((o) => filterFn(query, o)) : options;
    const showPopover = open;

    const select = (opt: ComboboxOption) => {
      onValueChange(opt.value);
      setSelectedLabel(opt.label);
      setOpen(false);
      setQuery("");
    };

    const triggerOnKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            setOpen(true);
            break;
          }
          setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlight((h) => Math.max(h - 1, 0));
          break;
        case "Enter": {
          e.preventDefault();
          if (open && filtered.length > 0) {
            const target = filtered[highlight] ?? filtered[0];
            if (target) select(target);
          } else {
            setOpen(true);
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    };

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div
          ref={containerRef}
          className="relative"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={
            open && filtered.length > 0 ? `${listboxId}-option-${highlight}` : undefined
          }
          aria-disabled={disabled || undefined}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={triggerOnKeyDown}
            className={cn(
              "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius-4)]",
              "bg-void-2 border-border-default border px-3 py-2",
              "text-text-primary text-sm",
              "ease-spring transition-[border-color,box-shadow] duration-200",
              "hover:border-border-strong",
              "focus-visible:border-border-accent focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              value ? "text-text-primary" : "text-text-placeholder",
            )}
          >
            <span className="truncate">{selectedLabel ?? placeholder}</span>
            <ChevronDown
              className={cn(
                "text-text-tertiary ease-spring size-4 transition-transform duration-200",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {/* Live region announces result count to screen readers */}
          {open ? (
            <span
              id={liveRegionId}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {filtered.length === 0
                ? emptyMessage
                : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
            </span>
          ) : null}
        </div>

        {showPopover ? (
          <div
            id={listboxId}
            role="listbox"
            className={cn(
              "z-dropdown absolute mt-1 max-h-72 w-full overflow-auto rounded-[var(--radius-4)]",
              "bg-surface-overlay border-border-subtle/40 shadow-2 border",
              "data-[state=open]:animate-[dropdown-enter_150ms_ease-out]",
              popoverClassName,
            )}
            data-state={open ? "open" : "closed"}
          >
            {/* Filter input */}
            <div className="border-border-subtle/40 bg-surface-overlay sticky top-0 border-b p-1.5">
              <input
                type="text"
                role="textbox"
                aria-label="Search"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                onKeyDown={triggerOnKeyDown}
                className={cn(
                  "w-full rounded-[var(--radius-2)] px-2 py-1.5 text-sm",
                  "bg-void-2 text-text-primary placeholder:text-text-placeholder",
                  "outline-none",
                )}
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-text-tertiary px-3 py-3 text-center text-sm">{emptyMessage}</p>
            ) : (
              filtered.map((opt, i) => {
                const selected = opt.value === value;
                const isHighlighted = i === highlight;
                return (
                  <button
                    key={opt.value}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={selected}
                    type="button"
                    onClick={() => select(opt)}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-left text-sm",
                      "text-text-primary transition-colors duration-100",
                      isHighlighted ? "bg-aether-4/15" : "",
                      selected ? "font-medium" : "",
                      selected ? "text-aether-6" : "",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    );
  },
);
Combobox.displayName = "Combobox";
