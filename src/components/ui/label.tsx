/**
 * @file Accessible label component to pair with form inputs.
 * @remarks Ensure the typography tokens remain aligned with the design system when theming changes.
 */
import { LabelHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-muted-foreground", className)}
      {...props}
    />
  )
);

Label.displayName = "Label";
