/**
 * @file Reusable button component styled in shadcn-like fashion for consistent CTAs.
 * @remarks Extend variants carefully; className contracts should remain stable for future design refinements.
 */
import { Slot } from "@radix-ui/react-slot";
import {
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode
} from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-lg hover:shadow-xl",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary shadow",
  outline:
    "border border-border bg-background text-foreground hover:bg-accent/10 focus-visible:ring-ring",
  ghost: "text-foreground hover:bg-accent/10 focus-visible:ring-ring",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive"
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 rounded-2xl px-6 py-2 text-sm",
  sm: "h-9 rounded-xl px-4 text-xs",
  lg: "h-12 rounded-2xl px-7 text-base",
  icon: "h-10 w-10 rounded-2xl"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, icon, children, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon}
        {children}
      </Component>
    );
  }
);
Button.displayName = "Button";
