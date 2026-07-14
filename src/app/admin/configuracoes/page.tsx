import { CrudPage } from "@/components/admin/crud-page";

export default function AdminSettingsPage() {
  return (
    <CrudPage
      title="Configurações"
      description="Configure textos institucionais, redes sociais, frete, pagamentos e parâmetros gerais da loja."
      columns={["Grupo", "Chave", "Valor"]}
      rows={[
        ["Frete", "free_shipping_min", "R$ 499"],
        ["Pagamento", "pix_enabled", "true"],
        ["Social", "instagram", "https://www.instagram.com/zion_aromas/"],
        ["Contato", "whatsapp", "13997566750"],
        ["Contato", "email", "zionaromasp@gmail.com"],
        [
          "Contato",
          "address",
          "Avenida Presidente Costa e Silva, 501 - Galeria PG - Ljs 70/75 - Boqueirão - Praia Grande - SP - CEP: 11700-007"
        ],
        ["Créditos", "agency", "Black Sites - https://bksly.com.br"]
      ]}
      fields={["Grupo", "Chave", "Valor JSON", "Rótulo"]}
    />
  );
}
