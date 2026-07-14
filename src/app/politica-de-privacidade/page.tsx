export default function PrivacyPage() {
  return <Policy title="Política de Privacidade" text="Tratamos dados de clientes para cadastro, pedidos, pagamento, envio, suporte e comunicação autorizada. O projeto está preparado para armazenar clientes, endereços, favoritos e pedidos com boas práticas de segurança." />;
}

function Policy({ title, text }: { title: string; text: string }) {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container max-w-3xl">
        <h1 className="font-display text-5xl">{title}</h1>
        <p className="mt-6 leading-8 text-black/62">{text}</p>
      </div>
    </section>
  );
}
