import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

const address =
  "Avenida Presidente Costa e Silva, 501 - Galeria PG - Ljs 70/75 - Boqueirão - Praia Grande - SP - CEP: 11700-007";

const columns = [
  {
    title: "Loja",
    links: [
      ["Perfumes Árabes", "/produtos?categoria=perfumes-arabes"],
      ["Oud & Amadeirados", "/produtos?categoria=oud-amadeirados"],
      ["Florais Orientais", "/produtos?categoria=florais-orientais"],
      ["Kits Presente", "/produtos?categoria=kits-presente"]
    ]
  },
  {
    title: "Atendimento",
    links: [
      ["Contato", "/contato"],
      ["FAQ", "/faq"],
      ["Trocas e Devoluções", "/trocas-e-devolucoes"],
      ["Política de Privacidade", "/politica-de-privacidade"]
    ]
  },
  {
    title: "Institucional",
    links: [
      ["Sobre", "/sobre"],
      ["Termos de Uso", "/termos"],
      ["Promoções", "/promocoes"],
      ["Novidades", "/novidades"]
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="arabic-pattern border-t border-gold/20 bg-black text-white">
      <div className="container grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1.2fr]">
        <div className="min-w-0">
          <Image
            src="/brand/zion-aromas-logo.png"
            alt="ZION AROMAS"
            width={150}
            height={150}
            className="mb-6 h-24 w-24 object-contain"
          />
          <h2 className="font-display text-3xl">ZION AROMAS</h2>
          <p className="mt-4 max-w-md leading-7 text-white/60">
            Loja especializada em perfumes árabes, fragrâncias orientais, oud, âmbar, musk e presentes premium.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/65">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 items-start gap-3 transition hover:text-gold"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span className="min-w-0 break-words">{address}</span>
            </a>
            <a href="https://wa.me/5513997566750" target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-3 transition hover:text-gold">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span className="min-w-0 break-words">WhatsApp: (13) 99756-6750</span>
            </a>
            <a href="mailto:zionaromasp@gmail.com" className="inline-flex min-w-0 items-center gap-3 transition hover:text-gold">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span className="min-w-0 break-words">zionaromasp@gmail.com</span>
            </a>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3 lg:gap-10">
          {columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold">{column.title}</h3>
              <div className="grid gap-3">
                {column.links.map(([label, href]) => (
                  <Link key={href} href={href} className="min-w-0 break-words text-sm text-white/62 transition hover:text-gold">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gold/15 bg-black/55">
        <div className="container flex flex-col gap-4 py-7 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <a href="https://www.instagram.com/zion_aromas/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-gold">
            <Instagram className="h-5 w-5" />
            @zion_aromas
          </a>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span>© 2026 ZION AROMAS</span>
            <span>
              Feito por{" "}
              <a href="https://bksly.com.br" target="_blank" rel="noreferrer" className="text-gold transition hover:text-gold-light">
                Black Sites
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
