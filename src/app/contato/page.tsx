import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const address =
  "Avenida Presidente Costa e Silva, 501 - Galeria PG - Ljs 70/75 - Boqueirão - Praia Grande - SP - CEP: 11700-007";

export default function ContactPage() {
  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Atendimento ZION</p>
          <h1 className="mt-3 font-display text-5xl">Fale com a nossa equipe</h1>
          <p className="mt-4 leading-7 text-white/60">
            Receba orientação para escolher sua fragrância, consultar disponibilidade, acompanhar pedidos ou montar um presente especial.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-white/65">
            <a href="https://wa.me/5513997566750" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 transition hover:text-gold">
              <MessageCircle className="h-5 w-5 text-gold" />
              WhatsApp: (13) 99756-6750
            </a>
            <a href="mailto:zionaromasp@gmail.com" className="inline-flex items-center gap-3 transition hover:text-gold">
              <Mail className="h-5 w-5 text-gold" />
              zionaromasp@gmail.com
            </a>
            <a href="https://www.instagram.com/zion_aromas/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 transition hover:text-gold">
              <Instagram className="h-5 w-5 text-gold" />
              @zion_aromas
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="inline-flex items-start gap-3 transition hover:text-gold">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span>{address}</span>
            </a>
            <span className="inline-flex items-center gap-3">
              <Phone className="h-5 w-5 text-gold" />
              Atendimento em horário comercial
            </span>
          </div>
        </div>
        <form className="border border-gold/20 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)]">
          <div className="grid gap-4">
            <Input placeholder="Seu nome" />
            <Input placeholder="Seu e-mail" type="email" />
            <Input placeholder="Assunto do atendimento" />
            <textarea
              placeholder="Conte o que você procura: perfume para uso próprio, presente, ocasião ou pedido já realizado."
              className="min-h-36 rounded-3xl border border-gold/20 bg-black p-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
            />
            <Button type="submit">Enviar mensagem</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
