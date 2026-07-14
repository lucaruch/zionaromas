import { CrudPage } from "@/components/admin/crud-page";
import { categories } from "@/lib/data";

export default function AdminCategoriesPage() {
  return (
    <CrudPage
      title="Categorias"
      description="Gerencie categorias, subcategorias, imagens, descrições e SEO."
      columns={["Nome", "Slug", "Produtos"]}
      rows={categories.map((category, index) => [category.name, category.slug, String(index + 3)])}
      fields={["Nome", "Slug", "Categoria pai", "Descrição", "SEO title", "SEO description"]}
    />
  );
}
