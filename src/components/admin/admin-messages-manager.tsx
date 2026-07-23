"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Mail, MessageCircle, Search } from "lucide-react";
import type { AdminContactMessage } from "@/lib/admin-data";

const statusLabels: Record<AdminContactMessage["status"], string> = {
  NOVO: "Nova",
  RESPONDIDO: "Respondida",
  ARQUIVADO: "Arquivada"
};

export function AdminMessagesManager({ messages }: { messages: AdminContactMessage[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [notice, setNotice] = useState("");

  const filteredMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return messages.filter((message) => {
      const matchesQuery =
        !normalized ||
        [message.name, message.email, message.subject, message.message].some((value) => value.toLowerCase().includes(normalized));
      const matchesStatus = status === "all" || message.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [messages, query, status]);

  async function updateStatus(id: string, nextStatus: AdminContactMessage["status"]) {
    setNotice("");
    const response = await fetch("/api/admin/mensagens", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus })
    });

    if (!response.ok) {
      setNotice("Não foi possível atualizar a mensagem.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
      <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Central de atendimento</p>
          <h1 className="mt-2 text-2xl font-black text-white">Mensagens recebidas</h1>
        </div>
        <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">
          {messages.length} mensagens
        </span>
      </div>
      <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_220px]">
        <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar cliente, assunto ou mensagem" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
          <option value="all">Todas</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {notice ? <p className="border-b border-gold/10 px-5 py-3 text-sm text-gold">{notice}</p> : null}
      {filteredMessages.map((message) => (
        <article key={message.id} className="grid gap-5 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gold">
                {statusLabels[message.status]}
              </span>
              <span className="text-xs text-white/45">{new Date(message.createdAt).toLocaleString("pt-BR")}</span>
            </div>
            <h2 className="mt-4 text-lg font-black text-white">{message.subject}</h2>
            <p className="mt-1 text-sm text-white/58">{message.name} · {message.email}</p>
            <p className="mt-4 max-w-3xl whitespace-pre-wrap leading-7 text-white/70">{message.message}</p>
          </div>
          <div className="grid h-max gap-3">
            <select value={message.status} onChange={(event) => updateStatus(message.id, event.target.value as AdminContactMessage["status"])} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <a href={`mailto:${message.email}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gold/20 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-gold hover:text-gold">
              <Mail className="h-4 w-4" /> E-mail
            </a>
            {message.phone ? (
              <a href={`https://wa.me/55${message.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gold/20 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-gold hover:text-gold">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            ) : null}
          </div>
        </article>
      ))}
      {!filteredMessages.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhuma mensagem encontrada.</p> : null}
    </section>
  );
}
