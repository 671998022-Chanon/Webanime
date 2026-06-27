// @nexus/ui — design system primitives (Tailwind 4 + React 19)
/* eslint-disable import/no-unresolved -- relative TS imports resolved by tsconfig project */

// Utilities
export { cn } from "./lib/cn";

// Theme
export {
  ThemeProvider,
  useTheme,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
  type Theme,
  type ResolvedTheme,
  type ThemeState,
} from "./theme";

// Components
export { Button, buttonVariants } from "./components/button";
export { Input, Textarea, InputIcon } from "./components/input";
export { Card } from "./components/card";
export { Badge } from "./components/badge";
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/dialog";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/tabs";
export { Avatar } from "./components/avatar";
export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonRect } from "./components/skeleton";
export {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  WithTooltip,
} from "./components/tooltip";
export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
  DropdownGroup,
  DropdownPortal,
  DropdownSub,
} from "./components/dropdown";
export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./components/select";
export { Checkbox } from "./components/checkbox";
export { Switch } from "./components/switch";
export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "./components/toast";
export { Spinner } from "./components/spinner";
