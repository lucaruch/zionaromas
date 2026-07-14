const faqs = [
  [
    "Os perfumes são árabes?",
    "Sim. A ZION AROMAS trabalha com fragrâncias de inspiração árabe e oriental, com destaque para oud, âmbar, musk, especiarias, rosas e madeiras nobres."
  ],
  [
    "Qual a diferença dos perfumes árabes?",
    "Eles costumam ter maior intensidade, projeção marcante e notas mais encorpadas. São perfumes pensados para deixar presença e fixar por mais tempo na pele."
  ],
  [
    "Como escolher meu perfume?",
    "Para fragrâncias intensas, escolha oud e amadeirados. Para algo elegante e levemente adocicado, escolha florais orientais. Para presente, os kits são a opção mais segura."
  ],
  [
    "Como funciona o frete?",
    "O checkout calcula PAC e SEDEX pelos Correios via Melhor Envio. O prazo e valor aparecem após informar o CEP."
  ],
  [
    "Quais formas de pagamento?",
    "A loja está preparada para PIX, cartão e boleto. As opções finais podem variar conforme a configuração de pagamento ativa."
  ],
  [
    "Posso trocar um perfume?",
    "Sim, desde que o produto esteja sem uso, lacrado, na embalagem original e dentro do prazo informado na política de trocas."
  ]
];

export default function FaqPage() {
  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container max-w-4xl">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Atendimento</p>
        <h1 className="mt-3 font-display text-5xl">FAQ</h1>
        <p className="mt-4 leading-7 text-white/60">
          Dúvidas frequentes sobre perfumes árabes, compra, entrega e atendimento.
        </p>
        <div className="mt-10 grid gap-4">
          {faqs.map(([question, answer]) => (
            <details key={question} className="border border-gold/18 bg-white/[0.03] p-6">
              <summary className="cursor-pointer font-semibold text-gold">{question}</summary>
              <p className="mt-4 leading-7 text-white/60">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
