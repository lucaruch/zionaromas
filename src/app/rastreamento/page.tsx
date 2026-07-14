import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrackingPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container max-w-3xl">
        <h1 className="font-display text-5xl">Rastreamento</h1>
        <p className="mt-4 leading-7 text-black/60">Consulte o status de envio usando o código do pedido ou rastreio.</p>
        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Input placeholder="ZA-1029 ou código de rastreio" />
          <Button>Consultar</Button>
        </form>
      </div>
    </section>
  );
}
