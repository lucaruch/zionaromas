"use client";

import { Check, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShippingSettings } from "@/lib/shipping-settings";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ShippingSettingsForm({ initialSettings }: { initialSettings: ShippingSettings }) {
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const statusText = useMemo(() => {
    if (saveState === "saved") return "Configuração de entrega salva com sucesso.";
    if (saveState === "error") return "Não foi possível salvar. Tente novamente.";
    return "Entrega configurada para cálculo pelos Correios.";
  }, [saveState]);

  function update<K extends keyof ShippingSettings>(key: K, value: ShippingSettings[K]) {
    setSaveState("idle");
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function toggleService(service: string) {
    setSaveState("idle");
    setSettings((current) => {
      const exists = current.correiosServices.includes(service);
      const next = exists
        ? current.correiosServices.filter((item) => item !== service)
        : [...current.correiosServices, service];
      return { ...current, correiosServices: next.length ? next : current.correiosServices };
    });
  }

  async function saveSettings() {
    setSaveState("saving");
    const response = await fetch("/api/admin/shipping-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    setSaveState(response.ok ? "saved" : "error");
  }

  return (
    <div className="border border-gold/18 bg-[#0d0b08] shadow-[0_24px_70px_rgba(0,0,0,.28)]">
      <div className="border-b border-gold/14 p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold/75">Entrega da loja</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-4xl text-white sm:text-5xl">Frete e retirada</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Ajuste origem, modalidades dos Correios, retirada na loja e campanhas de frete grátis.
            </p>
          </div>
          <div className="inline-flex w-max items-center gap-2 border border-gold/20 bg-black px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">
            <Truck className="h-4 w-4" />
            Correios
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7">
        <section className="grid gap-4 md:grid-cols-2">
          <Input placeholder="CEP de origem" value={settings.originPostalCode} onChange={(event) => update("originPostalCode", event.target.value)} />
          <Input placeholder="Peso padrão em kg" type="number" min="0.1" step="0.1" value={settings.defaultWeightKg} onChange={(event) => update("defaultWeightKg", Number(event.target.value))} />
          <Input placeholder="Largura padrão em cm" type="number" min="1" value={settings.defaultWidthCm} onChange={(event) => update("defaultWidthCm", Number(event.target.value))} />
          <Input placeholder="Altura padrão em cm" type="number" min="1" value={settings.defaultHeightCm} onChange={(event) => update("defaultHeightCm", Number(event.target.value))} />
          <Input placeholder="Comprimento padrão em cm" type="number" min="1" value={settings.defaultLengthCm} onChange={(event) => update("defaultLengthCm", Number(event.target.value))} />
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {[
            ["1", "PAC"],
            ["2", "SEDEX"]
          ].map(([service, label]) => {
            const selected = settings.correiosServices.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={selected ? "flex items-center justify-between border border-gold bg-gold-metal p-4 text-left font-black text-black" : "flex items-center justify-between border border-gold/16 bg-black/35 p-4 text-left font-semibold text-white/72 transition hover:border-gold/55"}
              >
                {label}
                {selected ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="flex min-h-16 items-center justify-between gap-4 border border-gold/18 bg-black px-4 text-sm text-white">
            <span>
              <strong className="block">Retirada na loja</strong>
              <span className="text-xs text-white/45">Exibe uma opção de retirada no checkout.</span>
            </span>
            <input type="checkbox" checked={settings.pickupEnabled} onChange={(event) => update("pickupEnabled", event.target.checked)} className="accent-gold" />
          </label>
          <Input placeholder="Nome da retirada" value={settings.pickupLabel} onChange={(event) => update("pickupLabel", event.target.value)} />
          <label className="flex min-h-16 items-center justify-between gap-4 border border-gold/18 bg-black px-4 text-sm text-white">
            <span>
              <strong className="block">Frete grátis</strong>
              <span className="text-xs text-white/45">Libera uma opção sem custo acima do valor mínimo.</span>
            </span>
            <input type="checkbox" checked={settings.freeShippingEnabled} onChange={(event) => update("freeShippingEnabled", event.target.checked)} className="accent-gold" />
          </label>
          <Input placeholder="Valor mínimo para frete grátis" type="number" min="0" step="1" value={settings.freeShippingThreshold} onChange={(event) => update("freeShippingThreshold", Number(event.target.value))} />
        </section>

        <div className="flex flex-col gap-4 border-t border-gold/14 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className={saveState === "error" ? "text-sm text-red-300" : "text-sm text-white/58"}>{statusText}</p>
          <Button type="button" onClick={saveSettings} disabled={saveState === "saving"} className="w-full sm:w-auto">
            {saveState === "saving" ? "Salvando..." : "Salvar entrega"}
          </Button>
        </div>
      </div>
    </div>
  );
}
