import { CrudPage } from "@/components/admin/crud-page";
import { categories } from "@/lib/data";

export default function AdminCategoriesPage() {
  return (
    <CrudPage
      title="Marcas"
      description="Organize as marcas exibidas na loja, seus textos, imagens e informações de busca."
      columns={["Marca", "Slug", "Produtos"]}
      rows={categories.map((category, index) => [category.name, category.slug, String(index + 3)])}
      fields={["Marca", "Link amigável", "Descrição da marca", "Título para busca", "Resumo para busca"]}
    />
  );
}
