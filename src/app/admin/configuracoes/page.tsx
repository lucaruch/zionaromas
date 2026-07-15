import { CrudPage } from "@/components/admin/crud-page";

export default function AdminSettingsPage() {
  return (
    <CrudPage
      title="Configurações"
      description="Mantenha dados institucionais, contatos, formas de entrega e informações gerais sempre atualizados."
      columns={["Seção", "Item", "Informação"]}
      rows={[
        ["Frete", "Valor mínimo para frete especial", "R$ 499"],
        ["Pagamento", "PIX habilitado", "Sim"],
        ["Social", "Instagram", "https://www.instagram.com/zion_aromas/"],
        ["Contato", "WhatsApp", "(13) 99756-6750"],
        ["Contato", "E-mail", "zionaromasp@gmail.com"],
        [
          "Contato",
          "Endereço",
          "Avenida Presidente Costa e Silva, 501 - Galeria PG - Ljs 70/75 - Boqueirão - Praia Grande - SP - CEP: 11700-007"
        ],
        ["Créditos", "Desenvolvimento", "Black Sites - https://bksly.com.br"]
      ]}
      fields={["Seção", "Nome do item", "Informação exibida", "Observação interna"]}
    />
  );
}
