import { CrudPage } from "@/components/admin/crud-page";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <CrudPage
      title="Produtos"
      description="Cadastre nome, descrição rica, preço, promoção, estoque, SKU, categoria, marca, galeria, peso, volume, status e SEO."
      columns={["Produto", "SKU", "Preço", "Estoque", "Status"]}
      rows={products.map((product) => [product.name, product.sku, formatCurrency(product.salePrice ?? product.price), String(product.stock), product.status])}
      fields={["Nome", "Preço", "Preço promocional", "SKU", "Estoque", "Categoria", "Marca", "Peso", "Volume", "Status", "SEO title", "SEO description"]}
    />
  );
}
