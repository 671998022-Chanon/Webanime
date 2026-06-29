// @nexus/ui — Command Palette (�K)
// Wraps cmdk (canonical �K component) inside the existing Radix Dialog primitive.
// Provides search/filter, grouped items, empty + loading states, and shortcut
// display. Keyboard: cmdk handles ↑↓ to navigate, Enter to select, Esc to close.
// Activation (⌘K shortcut) is the consumer's responsibility — this file only
// provides the palette.";

import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "../lib/cn";

import { Dialog, DialogContent } from "./dialog";

/* ---------------- CommandDialog ---------------- */

interface CommandDialogProps extends DialogProps {}

function CommandDialog({ children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        showClose={false}
        size="lg"
        className={cn(
          "max-w-2xl overflow-hidden p-0",
          "data-[state=open]:animate-[command-dialog-enter_200ms_ease-spring]",
          "data-[state=closed]:animate-[command-dialog-exit_150ms_ease-in]",
        )}
        // Prevent Radix Dialog from closing on overlay click — cmdk's empty
        // state may still be animating. Consumer controls open/close.
        onOverlayClick={(e: React.MouseEvent) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          // cmdk clears input on Esc when input is non-empty (its default).
          // Only prevent Dialog's Esc-to-close when input is non-empty so cmdk
          // can do its own thing first.
          const input = (e.currentTarget as HTMLElement).querySelector<HTMLInputElement>(
            "input[data-slot='command-input']",
          );
          if (input && input.value !== "") {
            e.preventDefault();
          }
        }}
      >
        <CommandPrimitive
          className={cn(
            "[&_[cmdk-group-heading]]:text-text-tertiary",
            "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
            "[&_[cmdk-group]]:px-2 [&_[cmdk-group]]:pt-2",
            "[&_[cmdk-input-wrapper]_svg]:size-5",
            "[&_[cmdk-input]]:h-12",
            "[&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:rounded-[var(--radius-2)] [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5",
            "[&_[cmdk-item][data-selected='true']]:bg-action-ghost-hover [&_[cmdk-item][data-selected='true']]:text-text-primary",
            "[&_[cmdk-item][data-disabled='true']]:pointer-events-none [&_[cmdk-item][data-disabled='true']]:opacity-50",
          )}
        >
          {children}
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Input ---------------- */

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  className?: string;
  /** Input placeholder text — surfaced separately because cmdk's complex Input prop typing omits it from the static surface. */
  placeholder?: string;
  /** Controlled input value — surfaced separately because cmdk's complex Input prop typing omits it from the static surface. */
  value?: string;
  /** Controlled change handler — surfaced separately because cmdk's complex Input prop typing omits it from the static surface. */
  onValueChange?: (value: string) => void;
}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div className="border-border-subtle flex items-center border-b px-3" cmdk-input-wrapper="">
    <CommandPrimitive.Input
      ref={ref}
      data-slot="command-input"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-autocomplete="list"
      role="combobox"
      aria-expanded="true"
      className={cn(
        "flex h-11 w-full bg-transparent py-3 text-sm outline-none",
        "text-text-primary placeholder:text-text-tertiary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = "Command.Input";

/* ---------------- List ---------------- */

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    className={cn("max-h-80 overflow-y-auto overscroll-contain px-2 py-2", className)}
    {...props}
  />
));
CommandList.displayName = "Command.List";

/* ---------------- Empty ---------------- */

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    className="text-text-secondary py-6 text-center text-sm"
    {...props}
  />
));
CommandEmpty.displayName = "Command.Empty";

/* ---------------- Group ---------------- */

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    className={cn("overflow-hidden", className)}
    {...props}
  />
));
CommandGroup.displayName = "Command.Group";

/* ---------------- Separator ---------------- */

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    data-slot="command-separator"
    className={cn("bg-border-subtle -mx-2 h-px", className)}
    {...props}
  />
));
CommandSeparator.displayName = "Command.Separator";

/* ---------------- Item ---------------- */

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-slot="command-item"
    className={cn(
      "relative flex select-none items-center gap-2 rounded-[var(--radius-2)] px-2 py-3 text-sm",
      "text-text-secondary cursor-pointer",
      "aria-selected:bg-action-ghost-hover aria-selected:text-text-primary",
      "data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "Command.Item";

/* ---------------- Shortcut ---------------- */

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-text-tertiary ml-auto inline-flex items-center gap-0.5 font-mono text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}
CommandShortcut.displayName = "Command.Shortcut";

/* ---------------- Loading ---------------- */

interface CommandLoadingProps extends Omit<
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>,
  "className"
> {}

const CommandLoading = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Loading>,
  CommandLoadingProps
>(({ ...props }, ref) => (
  <CommandPrimitive.Loading ref={ref} data-slot="command-loading" {...props} />
));
CommandLoading.displayName = "Command.Loading";

export {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
};
// Re-export cmdk's Command root as our default for consumers that build their own container.
export { CommandPrimitive };
