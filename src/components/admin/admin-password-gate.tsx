"use client";

import Image from "next/image";
import { Lock } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminPasswordGate() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      window.location.reload();
      return;
    }

    setError("Senha incorreta. Tente novamente.");
    setLoading(false);
  }

  return (
    <section className="arabic-pattern grid min-h-screen place-items-center bg-black px-4 py-16 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-gold/20 bg-[#0d0b08] p-8 shadow-[0_28px_90px_rgba(0,0,0,.55)]">
        <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={110} height={110} className="mx-auto mb-5 h-24 w-24 object-contain" />
        <div className="text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-black text-gold">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-display text-4xl">Painel ZION AROMAS</h1>
          <p className="mt-2 text-sm text-white/55">Acesso reservado para gestão da loja.</p>
        </div>
        <div className="mt-7 grid gap-3">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            autoFocus
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Validando..." : "Acessar painel"}
          </Button>
        </div>
      </form>
    </section>
  );
}
