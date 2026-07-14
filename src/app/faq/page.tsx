const faqs = [
  ["Como funciona o frete?", "O checkout calcula o frete a partir do CEP e pode ser configurado no painel administrativo."],
  ["Quais formas de pagamento?", "PIX, cartão e boleto estão previstos no fluxo de checkout."],
  ["Posso trocar um produto?", "Sim. A política de trocas segue o prazo legal e pode ser ajustada pelo painel."],
  ["Os produtos são originais?", "Sim. A loja foi estruturada para produtos autorais e curadoria da marca ZION AROMAS."]
];

export default function FaqPage() {
  return (
    <section className="bg-white pb-20 pt-32">
      <div className="container max-w-4xl">
        <h1 className="font-display text-5xl">FAQ</h1>
        <div className="mt-10 grid gap-4">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-lg border border-black/10 p-6">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-4 leading-7 text-black/60">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
