import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary-light",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary-light",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive-light",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success-light",
        warning:
          "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning-light",
        info:
          "border-transparent bg-info text-info-foreground [a&]:hover:bg-info-light",
        outline:
          "text-foreground border-border [a&]:hover:bg-surface-orange-light [a&]:hover:border-primary [a&]:hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
