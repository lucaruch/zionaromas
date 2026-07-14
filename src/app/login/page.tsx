"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("/minha-conta");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/minha-conta");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false
    });
    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <section className="grid min-h-screen place-items-center bg-black px-4 py-28 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-8 backdrop-blur">
        <h1 className="font-display text-4xl">Entrar</h1>
        <p className="mt-3 text-sm leading-6 text-white/58">Acesse pedidos, favoritos e atendimento premium.</p>
        <div className="mt-7 grid gap-4">
          <Input name="email" placeholder="E-mail" type="email" required className="border-white/10 bg-white/10 text-white placeholder:text-white/45" />
          <Input name="password" placeholder="Senha" type="password" required className="border-white/10 bg-white/10 text-white placeholder:text-white/45" />
          {error ? <p className="text-sm text-gold">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
        </div>
        <div className="mt-5 flex justify-between text-sm text-white/60">
          <Link href="/cadastro" className="hover:text-gold">Criar conta</Link>
          <Link href="/recuperar-senha" className="hover:text-gold">Recuperar senha</Link>
        </div>
      </form>
    </section>
  );
}
