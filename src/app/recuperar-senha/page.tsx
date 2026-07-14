import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecoverPasswordPage() {
  return (
    <section className="grid min-h-screen place-items-center bg-pearl px-4 py-28">
      <form className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="font-display text-4xl">Recuperar senha</h1>
        <p className="mt-3 text-sm leading-6 text-black/58">Informe seu e-mail para receber as instruções de acesso.</p>
        <div className="mt-7 grid gap-4">
          <Input placeholder="E-mail" type="email" />
          <Button type="submit">Enviar instruções</Button>
        </div>
      </form>
    </section>
  );
}
