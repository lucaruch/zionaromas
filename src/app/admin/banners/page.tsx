import { CrudPage } from "@/components/admin/crud-page";

export default function AdminBannersPage() {
  return (
    <CrudPage
      title="Banners"
      description="Atualize chamadas principais, imagens de destaque e links estratégicos da loja."
      columns={["Título", "Local", "Botão", "Status"]}
      rows={[
        ["Perfumes para quem deixa presença", "Home", "Explorar seleção", "Ativo"],
        ["Marcas árabes selecionadas", "Marcas", "Ver marcas", "Ativo"]
      ]}
      fields={["Título", "Texto de apoio", "Imagem", "Texto do botão", "Link de destino", "Local de exibição", "Ordem", "Status"]}
    />
  );
}
