import Link from "next/link";
import { Heart, Package, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const shortcuts = [
  { href: "/pedidos", label: "Meus pedidos", icon: Package },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/rastreamento", label: "Rastreamento", icon: Package }
];

export default function AccountPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg bg-black p-8 text-white">
            <UserRound className="mb-6 h-10 w-10 text-gold" />
            <h1 className="font-display text-5xl">Minha conta</h1>
            <p className="mt-4 leading-7 text-white/62">
              Acompanhe pedidos, endereços, favoritos e preferências de atendimento.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/login">
                <Button>Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button variant="glass">Criar conta</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {shortcuts.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-black/10 p-7 transition hover:-translate-y-1 hover:border-gold hover:shadow-premium"
              >
                <Icon className="mb-6 h-7 w-7 text-gold-deep" />
                <h2 className="font-display text-2xl">{label}</h2>
                <p className="mt-2 text-sm leading-6 text-black/55">Acesso rápido à sua experiência ZION.</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
