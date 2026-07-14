import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        gold: "bg-gold-metal text-black shadow-gold hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(212,175,55,.35)]",
        black: "bg-black text-white ring-1 ring-gold/25 hover:bg-black/85 hover:text-gold",
        outline: "border border-black/15 bg-white text-black hover:border-gold hover:text-gold-deep",
        ghost: "text-black hover:bg-black/5",
        glass: "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "gold",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);

Button.displayName = "Button";

export { buttonVariants };
