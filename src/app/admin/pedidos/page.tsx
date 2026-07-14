import { CrudPage } from "@/components/admin/crud-page";

export default function AdminOrdersPage() {
  return (
    <CrudPage
      title="Pedidos"
      description="Atualize o fluxo: recebido, pago, separação, enviado, entregue e cancelado."
      columns={["Pedido", "Cliente", "Total", "Status"]}
      rows={[["ZA-1040", "Marina Lima", "R$ 579,80", "Pago"], ["ZA-1039", "Rafael Costa", "R$ 249,90", "Separação"], ["ZA-1038", "Bianca Alves", "R$ 159,90", "Enviado"]]}
      fields={["Código", "Cliente", "Status", "Pagamento", "Frete", "Cupom", "Rastreamento"]}
    />
  );
}
