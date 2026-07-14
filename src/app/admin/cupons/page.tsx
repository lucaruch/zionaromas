import { CrudPage } from "@/components/admin/crud-page";

export default function AdminCouponsPage() {
  return (
    <CrudPage
      title="Cupons"
      description="Crie cupons por percentual, valor fixo, validade e status."
      columns={["Código", "Desconto", "Validade", "Status"]}
      rows={[["ZION35", "R$ 35", "31/08/2026", "Ativo"], ["ROYAL10", "10%", "15/09/2026", "Ativo"]]}
      fields={["Código", "Descrição", "Percentual", "Valor fixo", "Início", "Validade", "Status"]}
      actionLabel="Criar cupom"
    />
  );
}
