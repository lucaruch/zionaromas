import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge>Maison ZION</Badge>
          <h1 className="mt-4 font-display text-5xl">Luxo sensorial, presença e silêncio</h1>
          <p className="mt-6 leading-8 text-black/62">
            A ZION AROMAS nasce para transformar fragrância em identidade. Cada produto combina estética minimalista, matérias-primas nobres e uma experiência de compra pensada para conversão e encantamento.
          </p>
          <p className="mt-4 leading-8 text-black/62">
            O painel administrativo permite alterar banners, textos institucionais, redes sociais, frete e pagamentos para manter a operação viva.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-black">
          <Image src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=85" alt="Atelier de perfumaria premium" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-88" />
        </div>
      </div>
    </section>
  );
}
