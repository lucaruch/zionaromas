import Image from "next/image";
import { Eye, Pencil, Package, Search, SlidersHorizontal, ShoppingBag, Trash2, MessageSquare, Ticket } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Produtos" value={String(products.length)} icon={Package} />
        <StatCard label="Pedidos abertos" value="0" icon={ShoppingBag} />
        <StatCard label="Mensagens novas" value="0" icon={MessageSquare} />
        <StatCard label="Cupons ativos" value="0" icon={Ticket} />
      </div>

      <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 px-5 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#252b42]/70">Gestão de produtos</p>
            <h2 className="mt-2 text-2xl font-black">Catálogo da loja</h2>
          </div>
          <span className="w-max rounded-full bg-[#f3f4f7] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#252b42]">
            {products.length} itens
          </span>
        </div>

        <div className="grid gap-2 border-b border-black/10 bg-[#fbfbfc] p-4 md:grid-cols-[1fr_160px_152px]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-black/10 bg-white px-3 text-sm text-[#9297aa]">
            <Search className="h-4 w-4" />
            <input className="w-full bg-transparent outline-none" placeholder="Buscar nome, marca ou SKU" />
          </label>
          <label className="flex h-10 items-center gap-3 rounded-md border border-black/10 bg-white px-3 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-[#9297aa]" />
            <select className="w-full bg-transparent font-semibold outline-none">
              <option>Todos</option>
              <option>Perfumes</option>
              <option>Ambiente</option>
            </select>
          </label>
          <select className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none">
            <option>Todos os status</option>
            <option>Ativo</option>
            <option>Rascunho</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/10 text-[10px] font-bold uppercase tracking-[0.22em] text-[#252b42]/70">
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Preço</th>
                <th className="px-5 py-4">Estoque</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-b border-black/10 last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-[#f2f2f5]">
                        <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-black">{product.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#687087]">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#252b42]">{product.category}</td>
                  <td className="px-5 py-4 text-sm font-black">{formatCurrency(product.salePrice ?? product.price)}</td>
                  <td className="px-5 py-4 text-sm">
                    <strong className={product.stock <= 3 ? "text-red-600" : "text-black"}>{product.stock}</strong>{" "}
                    <span className="text-[10px] uppercase text-[#687087]">un.</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-100 px-4 py-1 text-[10px] font-black uppercase text-emerald-700">
                      Ativo
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {[Eye, Pencil, Trash2].map((Icon, index) => (
                        <button
                          key={index}
                          className="grid h-9 w-9 place-items-center rounded-full border border-black/10 transition hover:border-black hover:bg-black hover:text-white"
                          aria-label="Ação do produto"
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
