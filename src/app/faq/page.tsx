const faqs = [
  [
    "Os perfumes vendidos pela ZION AROMAS são originais?",
    "Sim. A ZION AROMAS trabalha exclusivamente com perfumes árabes selecionados de marcas como Lattafa, Maison Alhambra, Armaf, Afnan, Al Wataniah, French Avenue, Orientica e Zakat. Cada pedido é conferido antes do envio para preservar apresentação, lacre e integridade da embalagem."
  ],
  [
    "Perfume árabe fixa mais?",
    "Em geral, perfumes árabes têm perfil mais intenso, com notas de oud, âmbar, musk, especiarias, baunilha e madeiras. A fixação varia conforme pele, clima e aplicação, mas são fragrâncias conhecidas por presença marcante e evolução prolongada."
  ],
  [
    "Como escolher uma fragrância sem experimentar?",
    "Observe as notas principais e a ocasião de uso. Oud e madeiras são mais imponentes; musk e notas florais ficam mais elegantes; baunilha, âmbar e especiarias trazem calor e sensualidade. Se quiser uma indicação mais precisa, chame no WhatsApp."
  ],
  [
    "Vocês têm pronta entrega?",
    "A disponibilidade aparece no produto e é confirmada no processamento do pedido. Quando houver qualquer divergência de estoque, nossa equipe entra em contato antes de seguir com a compra."
  ],
  [
    "Como funciona o frete?",
    "No checkout, informe o CEP para visualizar as opções dos Correios calculadas pelo Melhor Envio. O prazo começa a contar após confirmação de pagamento e postagem."
  ],
  [
    "Posso trocar ou devolver?",
    "Sim, conforme o Código de Defesa do Consumidor. Para perfumes, o produto precisa estar sem uso, lacrado e com embalagem original. A solicitação deve ser feita pelos canais de atendimento dentro do prazo informado na política de trocas."
  ]
];

export default function FaqPage() {
  return (
    <section className="arabic-pattern bg-black pb-20 pt-32 text-white">
      <div className="container max-w-4xl">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Dúvidas frequentes</p>
        <h1 className="mt-3 font-display text-5xl">Antes de escolher sua fragrância</h1>
        <p className="mt-4 leading-7 text-white/60">
          Reunimos as principais orientações sobre marcas, fixação, entrega e cuidados para uma compra segura.
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
