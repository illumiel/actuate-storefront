import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full resize-y rounded-keycap border border-base-border bg-base-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-none focus-visible:border-accent-violet/60 focus-visible:ring-1 focus-visible:ring-accent-violet/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
