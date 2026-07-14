import { CrudPage } from "@/components/admin/crud-page";

export default function AdminSettingsPage() {
  return (
    <CrudPage
      title="Configurações"
      description="Configure textos institucionais, redes sociais, frete, pagamentos e parâmetros gerais da loja."
      columns={["Grupo", "Chave", "Valor"]}
      rows={[["Frete", "free_shipping_min", "R$ 499"], ["Pagamento", "pix_enabled", "true"], ["Social", "instagram", "@zionaromas"]]}
      fields={["Grupo", "Chave", "Valor JSON", "Rótulo"]}
    />
  );
}
