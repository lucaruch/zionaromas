import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="border border-gold/18 bg-[#0d0b08] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">{label}</p>
          <strong className="mt-4 block text-2xl font-black text-white">{value}</strong>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/20 bg-black text-gold">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
