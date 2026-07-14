import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const columns = [
  {
    title: "Loja",
    links: [
      ["Produtos", "/produtos"],
      ["Promoções", "/promocoes"],
      ["Novidades", "/novidades"],
      ["Mais vendidos", "/mais-vendidos"]
    ]
  },
  {
    title: "Atendimento",
    links: [
      ["Minha conta", "/minha-conta"],
      ["Meus pedidos", "/pedidos"],
      ["Rastreamento", "/rastreamento"],
      ["Contato", "/contato"]
    ]
  },
  {
    title: "Institucional",
    links: [
      ["Sobre", "/sobre"],
      ["FAQ", "/faq"],
      ["Trocas e Devoluções", "/trocas-e-devolucoes"],
      ["Política de Privacidade", "/politica-de-privacidade"],
      ["Termos", "/termos"]
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.1fr_1.2fr]">
        <div>
          <Image src="/brand/zion-aromas-logo.png" alt="ZION AROMAS" width={150} height={150} className="mb-6 h-24 w-24 object-contain" />
          <h2 className="font-display text-3xl">ZION AROMAS</h2>
          <p className="mt-4 max-w-md leading-7 text-white/60">
            Perfumaria premium para quem valoriza presença, rituais sensoriais e luxo discreto.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/65">
            <span className="inline-flex items-center gap-3"><MapPin className="h-4 w-4 text-gold" /> Brasil, entrega nacional</span>
            <span className="inline-flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> WhatsApp premium configurável</span>
            <span className="inline-flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> contato@zionaromas.com</span>
          </div>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold">{column.title}</h3>
              <div className="grid gap-3">
                {column.links.map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm text-white/62 transition hover:text-gold">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <form className="flex max-w-xl gap-3">
            <Input placeholder="Receba lançamentos e convites exclusivos" className="border-white/10 bg-white/10 text-white placeholder:text-white/45" />
            <Button type="submit">Assinar</Button>
          </form>
          <div className="flex items-center gap-4 text-white/60">
            <Instagram className="h-5 w-5" />
            <span className="text-sm">© 2026 ZION AROMAS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
