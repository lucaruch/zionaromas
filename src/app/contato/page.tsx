import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="font-display text-5xl">Contato</h1>
          <p className="mt-4 leading-7 text-black/60">Atendimento consultivo para compras, presentes corporativos e suporte pós-venda.</p>
          <div className="mt-8 grid gap-4 text-sm text-black/65">
            <span className="inline-flex items-center gap-3"><MessageCircle className="h-5 w-5 text-gold-deep" /> WhatsApp configurável</span>
            <span className="inline-flex items-center gap-3"><Mail className="h-5 w-5 text-gold-deep" /> contato@zionaromas.com</span>
            <span className="inline-flex items-center gap-3"><Phone className="h-5 w-5 text-gold-deep" /> Atendimento em horário comercial</span>
          </div>
        </div>
        <form className="rounded-lg border border-black/10 p-6">
          <div className="grid gap-4">
            <Input placeholder="Nome" />
            <Input placeholder="E-mail" type="email" />
            <Input placeholder="Assunto" />
            <textarea placeholder="Mensagem" className="min-h-36 rounded-3xl border border-black/10 p-4 text-sm outline-none focus:border-gold" />
            <Button type="submit">Enviar mensagem</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
