import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,#eee_25%,#f8f8f8_37%,#eee_63%)] bg-[length:400%_100%]",
        className
      )}
    />
  );
}
