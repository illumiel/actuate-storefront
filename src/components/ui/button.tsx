import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-keycap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2 focus-visible:ring-offset-base",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-accent-violet to-accent-violet-dim text-white shadow-keycap hover:shadow-keycap-glow hover:-translate-y-0.5",
        secondary:
          "bg-base-raised text-ink border border-base-border hover:border-accent-cyan/50 hover:text-accent-cyan",
        ghost: "text-ink-muted hover:text-ink hover:bg-base-raised",
        outline:
          "border border-base-border text-ink hover:border-accent-violet/50 hover:text-accent-violet",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
