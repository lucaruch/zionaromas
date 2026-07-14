import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const address =
  "Avenida Presidente Costa e Silva, 501 - Galeria PG - Ljs 70/75 - Boqueirão - Praia Grande - SP - CEP: 11700-007";

export default function ContactPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="font-display text-5xl">Contato</h1>
          <p className="mt-4 leading-7 text-black/60">
            Atendimento consultivo para compras, presentes corporativos e suporte pós-venda.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-black/65">
            <a
              href="https://wa.me/5513997566750"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 transition hover:text-gold-deep"
            >
              <MessageCircle className="h-5 w-5 text-gold-deep" />
              WhatsApp: (13) 99756-6750
            </a>
            <a href="mailto:zionaromasp@gmail.com" className="inline-flex items-center gap-3 transition hover:text-gold-deep">
              <Mail className="h-5 w-5 text-gold-deep" />
              zionaromasp@gmail.com
            </a>
            <a
              href="https://www.instagram.com/zion_aromas/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 transition hover:text-gold-deep"
            >
              <Instagram className="h-5 w-5 text-gold-deep" />
              @zion_aromas
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-start gap-3 transition hover:text-gold-deep"
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
              <span>{address}</span>
            </a>
            <span className="inline-flex items-center gap-3">
              <Phone className="h-5 w-5 text-gold-deep" />
              Atendimento em horário comercial
            </span>
          </div>
        </div>
        <form className="rounded-lg border border-black/10 p-6">
          <div className="grid gap-4">
            <Input placeholder="Nome" />
            <Input placeholder="E-mail" type="email" />
            <Input placeholder="Assunto" />
            <textarea
              placeholder="Mensagem"
              className="min-h-36 rounded-3xl border border-black/10 p-4 text-sm outline-none focus:border-gold"
            />
            <Button type="submit">Enviar mensagem</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
