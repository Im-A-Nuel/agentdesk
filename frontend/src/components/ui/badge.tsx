import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase transition-colors duration-300",
  {
    variants: {
      variant: {
        default: "border-brass/25 bg-brass/12 text-brass",
        secondary: "border-border bg-panel text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/12 text-destructive",
        outline: "border-border-strong bg-card text-foreground/85",
        success: "border-live/30 bg-live/12 text-live",
        warn: "border-warn/30 bg-warn/12 text-warn",
        sky: "border-sky/30 bg-sky/12 text-sky",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };