import { CrudPage } from "@/components/admin/crud-page";
import { categories } from "@/lib/data";

export default function AdminCategoriesPage() {
  return (
    <CrudPage
      title="Marcas"
      description="Gerencie marcas, imagens, descrições e SEO."
      columns={["Marca", "Slug", "Produtos"]}
      rows={categories.map((category, index) => [category.name, category.slug, String(index + 3)])}
      fields={["Marca", "Slug", "Descrição", "SEO title", "SEO description"]}
    />
  );
}
