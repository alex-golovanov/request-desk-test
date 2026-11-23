import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "block min-h-44 w-full resize-y rounded-xl border border-input bg-field p-2.5 text-base leading-[1.55] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-invalid:border-destructive-foreground [@media(pointer:coarse)]:resize-none",
        className,
      )}
      {...props}
    />
  );
}
