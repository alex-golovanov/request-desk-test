import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "block min-h-44 w-full resize-y rounded-lg border border-input bg-card px-3.5 py-3 text-base leading-[1.55] text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-invalid:border-caution-foreground",
        className,
      )}
      {...props}
    />
  );
}
