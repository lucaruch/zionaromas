import { CrudPage } from "@/components/admin/crud-page";

export default function AdminCustomersPage() {
  return (
    <CrudPage
      title="Clientes"
      description="Consulte clientes, endereços, histórico de pedidos e preferências."
      columns={["Cliente", "E-mail", "Pedidos", "Total gasto"]}
      rows={[["Marina Lima", "marina@email.com", "4", "R$ 1.840"], ["Rafael Costa", "rafael@email.com", "2", "R$ 719"], ["Bianca Alves", "bianca@email.com", "3", "R$ 989"]]}
      fields={["Nome", "E-mail", "Telefone", "Documento", "CEP", "Endereço"]}
    />
  );
}
