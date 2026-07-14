import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-black/50">{label}</p>
          <strong className="mt-2 block font-display text-3xl">{value}</strong>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/12 text-gold-deep">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.14em] text-black/40">{trend}</p>
    </div>
  );
}
