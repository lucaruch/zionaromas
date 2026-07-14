import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-gold/45 bg-gold/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep shadow-[0_0_22px_rgba(212,175,55,.12)]",
        className
      )}
    >
      {children}
    </span>
  );
}
