"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  paymentProviders,
  providerLabels,
  type PaymentProvider,
  type PaymentSettings
} from "@/lib/payments";

type SaveState = "idle" | "saving" | "saved" | "error";

const providerDescriptions: Record<PaymentProvider, string> = {
  CIELO: "Operadora selecionada para processar as vendas online da loja.",
  GETNET: "Operadora selecionada para processar as vendas online da loja."
};

export function PaymentSettingsForm({ initialSettings }: { initialSettings: PaymentSettings }) {
  const [activeProvider, setActiveProvider] = useState<PaymentProvider>(initialSettings.activeProvider);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const activeProviderName = providerLabels[activeProvider];
  const canSave = saveState !== "saving";

  const statusText = useMemo(() => {
    if (saveState === "saved") return "Configuração salva com sucesso.";
    if (saveState === "error") return "Não foi possível salvar. Tente novamente.";
    return `${activeProviderName} selecionada para os pagamentos da loja.`;
  }, [activeProviderName, saveState]);

  async function saveSettings() {
    if (!canSave) return;

    setSaveState("saving");
    const response = await fetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activeProvider,
        environment: initialSettings.environment,
        enabledMethods: initialSettings.enabledMethods
      })
    });

    setSaveState(response.ok ? "saved" : "error");
  }

  return (
    <div className="border border-gold/18 bg-[#0d0b08] shadow-[0_24px_70px_rgba(0,0,0,.28)]">
      <div className="border-b border-gold/14 p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold/75">Pagamentos da loja</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl text-white sm:text-5xl">Operadora de pagamento</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Escolha qual operadora será usada para processar os pagamentos da ZION AROMAS.
            </p>
          </div>
          <div className="inline-flex w-max items-center gap-2 border border-gold/20 bg-black px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">
            <ShieldCheck className="h-4 w-4" />
            Ambiente protegido
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7">
        <section>
          <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white/72">Empresa responsável</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {paymentProviders.map((provider) => {
              const selected = activeProvider === provider;

              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => {
                    setActiveProvider(provider);
                    setSaveState("idle");
                  }}
                  className={
                    selected
                      ? "group min-h-[148px] border border-gold bg-gold-metal p-5 text-left text-black shadow-[0_18px_50px_rgba(212,175,55,.18)]"
                      : "group min-h-[148px] border border-gold/16 bg-black/35 p-5 text-left text-white transition hover:border-gold/55"
                  }
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block font-display text-3xl">{providerLabels[provider]}</span>
                      <span className={selected ? "mt-3 block text-sm leading-6 text-black/70" : "mt-3 block text-sm leading-6 text-white/58"}>
                        {providerDescriptions[provider]}
                      </span>
                    </span>
                    <span
                      className={
                        selected
                          ? "grid h-9 w-9 place-items-center rounded-full bg-black text-gold"
                          : "grid h-9 w-9 place-items-center rounded-full border border-gold/20 text-gold/50"
                      }
                    >
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-4 border-t border-gold/14 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className={saveState === "error" ? "text-sm text-red-300" : "text-sm text-white/58"}>{statusText}</p>
          <Button type="button" onClick={saveSettings} disabled={!canSave} className="w-full sm:w-auto">
            {saveState === "saving" ? "Salvando..." : "Salvar operadora"}
          </Button>
        </div>
      </div>
    </div>
  );
}
