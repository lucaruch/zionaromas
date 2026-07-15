import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge className="border-gold/40 bg-gold/10 text-gold">ZION AROMAS</Badge>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">Perfumaria árabe para quem escolhe presença</h1>
          <div className="mt-6 grid gap-5 leading-8 text-white/62">
            <p>
              A ZION AROMAS nasceu para aproximar a perfumaria árabe de quem valoriza intensidade, sofisticação e uma assinatura olfativa que permanece.
            </p>
            <p>
              Nossa seleção reúne marcas reconhecidas no universo oriental, como Lattafa, Maison Alhambra, Armaf, Afnan, Al Wataniah, French Avenue, Orientica e Zakat. Cada fragrância é escolhida pelo equilíbrio entre desempenho, beleza olfativa e valor percebido.
            </p>
            <p>
              Atendemos online e em Praia Grande com orientação próxima, embalagem cuidadosa e atenção aos detalhes que transformam a compra em uma experiência de presente, mesmo quando o perfume é para você.
            </p>
          </div>
        </div>
        <div className="gold-frame relative aspect-[4/5] overflow-hidden border border-gold/25 bg-black">
          <Image
            src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=85"
            alt="Perfumes árabes selecionados ZION AROMAS"
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
