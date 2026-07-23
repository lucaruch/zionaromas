"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        subject: form.get("subject"),
        message: form.get("message")
      })
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível enviar a mensagem agora.");
      return;
    }

    event.currentTarget.reset();
    setMessage("Mensagem enviada. Nossa equipe retornará em breve.");
  }

  return (
    <form onSubmit={submit} className="border border-gold/20 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)]">
      <div className="grid gap-4">
        <Input name="name" placeholder="Seu nome" required />
        <Input name="email" placeholder="Seu e-mail" type="email" required />
        <Input name="phone" placeholder="WhatsApp ou telefone" />
        <Input name="subject" placeholder="Assunto do atendimento" required />
        <textarea
          name="message"
          required
          minLength={10}
          placeholder="Conte o que você procura: perfume para uso próprio, presente, ocasião ou pedido já realizado."
          className="min-h-36 rounded-3xl border border-gold/20 bg-black p-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
        />
        <Button type="submit" disabled={saving}>{saving ? "Enviando..." : "Enviar mensagem"}</Button>
        {message ? <p className="text-sm leading-6 text-gold">{message}</p> : null}
      </div>
    </form>
  );
}
