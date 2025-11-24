import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border border-primary-light shadow-glow-sm hover:shadow-glow hover:from-primary-light hover:to-primary hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive-dark text-destructive-foreground border border-destructive-light hover:from-destructive-light hover:to-destructive hover:-translate-y-0.5",
        outline:
          "border border-border bg-background-light text-foreground hover:bg-background-lighter hover:border-primary hover:text-primary-foreground hover:shadow-glow-sm",
        secondary:
          "bg-background-light text-foreground-secondary border border-border hover:bg-background-lighter hover:border-primary/50 hover:text-foreground",
        ghost:
          "hover:bg-surface-orange-light hover:text-primary border border-transparent hover:border-border-orange",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary-light",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
