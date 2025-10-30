/**
 * @file Badge component for compact status pills and tags.
 * @remarks Keep colors mapped via utility classes so theme tokens can be swapped later.
 */
import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "soft";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-accent text-accent-foreground",
  outline: "border border-border text-foreground",
  soft: "bg-secondary text-secondary-foreground"
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      variantClasses[variant],
      className
    )}
    {...props}
  />
);
