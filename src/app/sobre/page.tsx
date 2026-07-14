import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge className="border-gold/40 bg-gold/10 text-gold">Perfumes árabes premium</Badge>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">A intensidade do Oriente em fragrâncias memoráveis</h1>
          <div className="mt-6 grid gap-5 leading-8 text-white/62">
            <p>
              A ZION AROMAS é uma loja especializada em perfumes árabes e fragrâncias orientais para quem busca presença,
              sofisticação e alta fixação.
            </p>
            <p>
              Nossa curadoria valoriza notas como oud, âmbar, musk, açafrão, rosa damascena, baunilha, incenso e madeiras
              nobres. São perfumes marcantes, elegantes e ideais para quem deseja uma assinatura olfativa inesquecível.
            </p>
            <p>
              Atendemos online e em Praia Grande, com foco em experiência premium, embalagem cuidadosa, orientação na
              escolha da fragrância e atendimento próximo pelo WhatsApp.
            </p>
          </div>
        </div>
        <div className="gold-frame relative aspect-[4/5] overflow-hidden border border-gold/25 bg-black">
          <Image
            src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=85"
            alt="Perfumes árabes premium ZION AROMAS"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-60 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
        </div>
      </div>
    </section>
  );
}
