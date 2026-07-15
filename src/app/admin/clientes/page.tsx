import { MessageCircle, Search } from "lucide-react";

const messages = [
  {
    status: "Arquivada",
    date: "01 de jul., 14:20",
    subject: "Fixação do perfume",
    name: "Lucas Ferreira",
    text: "Olá! O Sultan Oud tem projeção mais intensa ou fica mais rente à pele?"
  },
  {
    status: "Nova",
    date: "01 de jul., 12:10",
    subject: "Retirada na loja",
    name: "Beatriz Lima",
    text: "Consigo reservar um perfume e retirar amanhã no período da tarde?"
  },
  {
    status: "Nova",
    date: "30 de jun., 18:35",
    subject: "Disponibilidade de perfume árabe",
    name: "Gustavo Martins",
    text: "Vocês ainda têm o Royal Arabian Set disponível?"
  }
];

export default function AdminCustomersPage() {
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
      <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_200px]">
        <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
          <Search className="h-4 w-4" />
          <input className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar cliente, assunto ou mensagem" />
        </label>
        <select className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
          <option>Todas</option>
          <option>Novas</option>
          <option>Arquivadas</option>
        </select>
      </div>
      {messages.map((message) => (
        <article key={message.subject} className="grid gap-4 border-b border-gold/10 px-5 py-6 text-white last:border-0 md:grid-cols-[1fr_150px]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full border border-gold/18 bg-white/[0.04] px-3 py-1 font-black uppercase tracking-[0.12em] text-gold">{message.status}</span>
              <span className="text-white/45">{message.date}</span>
            </div>
            <h2 className="text-xl font-black">{message.subject}</h2>
            <p className="mt-1 text-sm font-semibold text-white/58">{message.name}</p>
            <p className="mt-4 leading-7 text-white/70">{message.text}</p>
          </div>
          <div className="grid h-max gap-2">
            <select defaultValue={message.status} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
              <option>Nova</option>
              <option>Respondida</option>
              <option>Arquivada</option>
            </select>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gold-metal px-4 text-[10px] font-black uppercase tracking-[0.14em] text-black">
              <MessageCircle className="h-4 w-4" />
              Responder
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
