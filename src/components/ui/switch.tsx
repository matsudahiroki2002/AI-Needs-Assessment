/**
 * @file Accessible switch component for binary toggles in filters.
 * @remarks Replace with Radix Switch when motion states are required; keep the API compatible meanwhile.
 */
import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, ...props }, ref) => (
    <label
      className={cn(
        "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-muted transition",
        checked ? "bg-primary/80" : "bg-muted",
        className
      )}
    >
      <input ref={ref} type="checkbox" className="sr-only" checked={checked} {...props} />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1 h-4 w-4 rounded-full bg-background transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </label>
  )
);

Switch.displayName = "Switch";
