import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
