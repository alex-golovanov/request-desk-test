import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = cva(
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 [@media(pointer:coarse)]:min-h-11 [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary px-3 text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-card px-3 text-foreground hover:bg-muted",
        ghost: "px-2 text-muted-foreground hover:bg-muted hover:text-foreground",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof variants> & { asChild?: boolean };

export function Button({ className, variant, asChild, type = "button", ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      type={asChild ? undefined : type}
      className={cn(variants({ variant }), className)}
      {...props}
    />
  );
}
