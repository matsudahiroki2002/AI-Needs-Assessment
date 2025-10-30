/**
 * @file Table primitives styled for data-rich views.
 * @remarks Align with HTML semantics to make future virtualization easier.
 */
import { forwardRef, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full border-collapse text-sm text-foreground", className)}
      {...props}
    />
  )
);
Table.displayName = "Table";

export const TableHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-muted/60 text-xs uppercase tracking-wide", className)} {...props} />
);

export const TableBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("", className)} {...props} />
);

export const TableRow = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b border-border last:border-0", className)} {...props} />
);

export const TableHead = ({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn("px-4 py-3 text-left font-medium text-muted-foreground", className)}
    {...props}
  />
);

export const TableCell = ({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-4 align-middle text-sm", className)} {...props} />
);
