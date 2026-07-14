"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password")
      })
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || "Não foi possível criar a conta.");
      return;
    }

    router.push("/login");
  }

  return (
    <section className="grid min-h-screen place-items-center bg-white px-4 py-28">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg border border-black/10 p-8 shadow-sm">
        <h1 className="font-display text-4xl">Cadastro</h1>
        <p className="mt-3 text-sm leading-6 text-black/58">Crie sua conta para salvar favoritos e acompanhar pedidos.</p>
        <div className="mt-7 grid gap-4">
          <Input name="name" placeholder="Nome completo" required />
          <Input name="email" placeholder="E-mail" type="email" required />
          <Input name="password" placeholder="Senha" type="password" required minLength={6} />
          {message ? <p className="text-sm text-gold-deep">{message}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button>
        </div>
        <Link href="/login" className="mt-5 inline-flex text-sm text-gold-deep">Já tenho conta</Link>
      </form>
    </section>
  );
}
