"use client";

import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminPasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Senha inválida.");
      return;
    }

    window.location.reload();
  }

  return (
    <section className="grid min-h-screen place-items-center bg-[#eeeeef] px-4 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8 shadow-sm">
        <Image
          src="/brand/zion-aromas-logo.png"
          alt="ZION AROMAS"
          width={82}
          height={82}
          className="mx-auto mb-6 h-20 w-20 rounded-full object-contain"
        />
        <div className="mb-6 text-center">
          <LockKeyhole className="mx-auto mb-3 h-6 w-6 text-gold-deep" />
          <h1 className="font-display text-3xl">Área administrativa</h1>
          <p className="mt-2 text-sm text-black/55">Digite a senha para acessar o painel.</p>
        </div>
        <div className="grid gap-3">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha do admin"
            autoFocus
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </section>
  );
}
