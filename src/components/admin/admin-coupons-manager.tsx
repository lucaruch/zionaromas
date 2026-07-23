"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCoupon } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

type CouponForm = AdminCoupon;

const emptyCoupon: CouponForm = {
  id: "",
  code: "",
  description: "",
  discountRate: "10",
  discountValue: "",
  maxUses: "",
  usedCount: 0,
  expiresAt: "",
  active: true
};

export function AdminCouponsManager({ coupons }: { coupons: AdminCoupon[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState<CouponForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesQuery = !query || coupon.code.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || (status === "active" ? coupon.active : !coupon.active);
      return matchesQuery && matchesStatus;
    });
  }, [coupons, query, status]);

  function update<K extends keyof CouponForm>(key: K, value: CouponForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveCoupon(event: FormEvent) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/cupons", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountRate: form.discountValue ? "" : form.discountRate,
        discountValue: form.discountValue || "",
        maxUses: form.maxUses || ""
      })
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível salvar o cupom.");
      return;
    }

    setForm(null);
    router.refresh();
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Excluir este cupom?")) return;
    const response = await fetch(`/api/admin/cupons?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Não foi possível excluir o cupom.");
      return;
    }
    router.refresh();
  }

  function discountLabel(coupon: AdminCoupon) {
    if (coupon.discountValue) return formatCurrency(Number(coupon.discountValue));
    if (coupon.discountRate) return `${coupon.discountRate}%`;
    return "Sem desconto";
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Campanha promocional</p>
            <h1 className="mt-2 text-2xl font-black text-white">Cupons da loja</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">
              {coupons.length} cupons
            </span>
            <Button size="sm" onClick={() => setForm(emptyCoupon)}>
              <Plus className="h-4 w-4" /> Criar cupom
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_200px]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar por código" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
        {message ? <p className="border-b border-gold/10 px-5 py-3 text-sm text-gold">{message}</p> : null}
        <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-[1fr_1fr_1fr_1fr_120px]">
          <span>Código</span>
          <span>Desconto</span>
          <span>Uso</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>
        {filteredCoupons.map((coupon) => (
          <div key={coupon.id} className="grid gap-3 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-[1fr_1fr_1fr_1fr_120px] md:items-center">
            <strong>{coupon.code}</strong>
            <span className="text-gold">{discountLabel(coupon)}</span>
            <span className="text-white/70">
              {coupon.usedCount}/{coupon.maxUses || "sem limite"}
              {coupon.expiresAt ? ` até ${new Date(`${coupon.expiresAt}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}
            </span>
            <span>
              <span className={coupon.active ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-[10px] font-black uppercase text-emerald-300" : "rounded-full border border-white/15 bg-white/[0.04] px-4 py-1 text-[10px] font-black uppercase text-white/50"}>
                {coupon.active ? "Ativo" : "Inativo"}
              </span>
            </span>
            <div className="flex justify-end gap-2">
              <button onClick={() => setForm(coupon)} className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Editar cupom">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => deleteCoupon(coupon.id)} className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Excluir cupom">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {!filteredCoupons.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhum cupom encontrado.</p> : null}
      </section>

      {form ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur">
          <form onSubmit={saveCoupon} className="w-full max-w-lg border border-gold/25 bg-[#070604] text-white shadow-[0_28px_90px_rgba(0,0,0,.75)]">
            <div className="flex items-center justify-between border-b border-gold/15 bg-black px-5 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Campanha promocional</p>
                <h2 className="mt-1 text-2xl font-black">{form.id ? "Editar cupom" : "Novo cupom"}</h2>
              </div>
              <button type="button" onClick={() => setForm(null)} className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-white hover:border-gold hover:text-gold">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <Input placeholder="Código do cupom" value={form.code} onChange={(event) => update("code", event.target.value.toUpperCase())} />
              <Input placeholder="Descrição" value={form.description} onChange={(event) => update("description", event.target.value)} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input placeholder="Desconto em %" value={form.discountRate} onChange={(event) => update("discountRate", event.target.value)} />
                <Input placeholder="Ou valor fixo" value={form.discountValue} onChange={(event) => update("discountValue", event.target.value)} />
                <Input type="date" placeholder="Validade" value={form.expiresAt} onChange={(event) => update("expiresAt", event.target.value)} />
                <Input inputMode="numeric" placeholder="Limite de uso (opcional)" value={form.maxUses} onChange={(event) => update("maxUses", event.target.value.replace(/\D/g, ""))} />
                <label className="flex h-11 items-center justify-between rounded-md border border-gold/18 bg-black px-4 text-sm">
                  Cupom ativo
                  <input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} className="accent-gold" />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gold/15 bg-black p-5">
              <button type="button" onClick={() => setForm(null)} className="h-11 rounded-full border border-gold/25 px-6 text-[10px] font-black uppercase tracking-[0.14em] text-white hover:border-gold">
                Cancelar
              </button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Salvar cupom
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
