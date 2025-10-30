/**
 * @file Skeleton placeholder component for loading states.
 * @remarks Reuse this component to ensure loading visuals remain consistent across the app.
 */
import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Skeleton = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn("animate-pulse rounded-2xl bg-muted", className)}
    {...props}
  />
);
