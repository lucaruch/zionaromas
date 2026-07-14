import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#252b42]/70">{label}</p>
          <strong className="mt-4 block text-2xl font-black text-black">{value}</strong>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f4f4f6] text-black">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
