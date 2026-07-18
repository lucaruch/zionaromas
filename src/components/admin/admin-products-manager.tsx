"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Check, Eye, ImagePlus, Loader2, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminBrand, AdminCategory, AdminProduct, AdminStats } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  sku: string;
  weight: string;
  volume: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  mainImage: string;
  gallery: string[];
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  categoryId: string;
  brandId: string;
};

const emptyForm = (brands: AdminBrand[], categories: AdminCategory[]): ProductForm => {
  const firstBrand = brands[0];
  return {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: "",
    salePrice: "",
    stock: "0",
    sku: "",
    weight: "1.00",
    volume: "100 ml",
    status: "ACTIVE",
    mainImage: "",
    gallery: [],
    featured: false,
    bestSeller: false,
    isNew: false,
    brandId: firstBrand?.id ?? "",
    categoryId: findCategoryForBrand(firstBrand?.slug, categories) ?? categories[0]?.id ?? ""
  };
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findCategoryForBrand(brandSlug: string | undefined, categories: AdminCategory[]) {
  if (!brandSlug) return undefined;
  return categories.find((category) => category.slug === brandSlug)?.id;
}

function makeSku(name: string) {
  const base = slugify(name).replace(/-/g, "").slice(0, 12).toUpperCase() || "PERFUME";
  return `ZION-${base}-${Date.now().toString().slice(-4)}`;
}

function limitText(value: string, max: number) {
  return value.length > max ? value.slice(0, max).trim() : value;
}

function toForm(product: AdminProduct): ProductForm {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    stock: String(product.stock),
    sku: product.sku,
    weight: product.weight || "1.00",
    volume: product.volume || "100 ml",
    status: product.status,
    mainImage: product.mainImage,
    gallery: product.gallery,
    featured: product.featured,
    bestSeller: product.bestSeller,
    isNew: product.isNew,
    categoryId: product.categoryId,
    brandId: product.brandId
  };
}

export function AdminProductsManager({
  products,
  brands,
  categories,
  stats
}: {
  products: AdminProduct[];
  brands: AdminBrand[];
  categories: AdminCategory[];
  stats: AdminStats;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState<ProductForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !normalized ||
        [product.name, product.brandName, product.sku].some((value) => value.toLowerCase().includes(normalized));
      const matchesBrand = brandFilter === "all" || product.brandId === brandFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesQuery && matchesBrand && matchesStatus;
    });
  }, [brandFilter, products, query, statusFilter]);

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function changeBrand(brandId: string) {
    const brand = brands.find((item) => item.id === brandId);
    setForm((current) =>
      current
        ? {
            ...current,
            brandId,
            categoryId: findCategoryForBrand(brand?.slug, categories) ?? current.categoryId
          }
        : current
    );
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length || !form) return;
    setUploading(true);
    setMessage("");

    const body = new FormData();
    Array.from(files).forEach((file) => body.append("files", file));
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json().catch(() => ({}));
    setUploading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível enviar as imagens.");
      return;
    }

    const uploaded = data.files as string[];
    setForm({
      ...form,
      mainImage: form.mainImage || uploaded[0],
      gallery: [...new Set([...form.gallery, ...uploaded])]
    });
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!form) return;

    if (!form.mainImage) {
      setMessage("Envie uma imagem do produto antes de salvar.");
      return;
    }

    setSaving(true);
    setMessage("");

    const slug = form.slug || slugify(form.name);
    const description =
      form.description.trim() ||
      form.shortDescription.trim() ||
      `Perfume árabe ${form.name} com presença sofisticada e excelente apresentação.`;
    const shortDescription = limitText(form.shortDescription.trim() || description, 500);
    const payload = {
      ...form,
      slug,
      sku: form.sku || makeSku(form.name),
      stock: Number(form.stock || 0),
      weight: form.weight || "1.00",
      gallery: form.gallery.length ? form.gallery : [form.mainImage],
      shortDescription,
      description,
      richDescription: description,
      seoTitle: `${form.name} | ZION AROMAS`,
      seoDescription: limitText(shortDescription, 240)
    };

    const response = await fetch("/api/admin/produtos", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível salvar o produto.");
      return;
    }

    setForm(null);
    router.refresh();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Excluir este produto da loja?")) return;
    const response = await fetch(`/api/admin/produtos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Não foi possível excluir o produto.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Produtos", stats.products],
          ["Pedidos abertos", stats.openOrders],
          ["Clientes", stats.customers],
          ["Cupons ativos", stats.activeCoupons]
        ].map(([label, value]) => (
          <div key={label} className="border border-gold/18 bg-[#0d0b08] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">{label}</p>
            <strong className="mt-3 block text-3xl text-white">{value}</strong>
          </div>
        ))}
      </div>

      <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
        <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Gestão de produtos</p>
            <h2 className="mt-2 text-2xl font-black text-white">Catálogo da loja</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">
              {products.length} itens
            </span>
            <Button size="sm" onClick={() => setForm(emptyForm(brands, categories))}>
              <Plus className="h-4 w-4" /> Adicionar produto
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_180px_152px]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar nome ou marca" />
          </label>
          <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white">
            <SlidersHorizontal className="h-4 w-4 text-gold" />
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="w-full bg-transparent font-semibold outline-none">
              <option value="all">Todas as marcas</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
            <option value="all">Todos os status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </div>

        {message ? <p className="border-b border-gold/10 px-5 py-3 text-sm text-gold">{message}</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/15 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Marca</th>
                <th className="px-5 py-4">Preço</th>
                <th className="px-5 py-4">Estoque</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gold/10 text-white last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden border border-gold/15 bg-black">
                        <Image src={product.mainImage} alt={product.name} fill sizes="48px" className="object-cover opacity-85" />
                      </div>
                      <div>
                        <p className="font-black">{product.name}</p>
                        <p className="mt-1 text-xs text-white/42">{product.volume || "Perfume árabe"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/70">{product.brandName}</td>
                  <td className="px-5 py-4 text-sm font-black text-gold">{formatCurrency(Number(product.salePrice || product.price))}</td>
                  <td className="px-5 py-4 text-sm">
                    <strong className={product.stock <= 3 ? "text-red-400" : "text-white"}>{product.stock}</strong>{" "}
                    <span className="text-[10px] uppercase text-white/42">un.</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-[10px] font-black uppercase text-emerald-300">
                      {product.status === "ACTIVE" ? "Ativo" : product.status === "DRAFT" ? "Rascunho" : "Arquivado"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <a href={`/produto/${product.slug}`} target="_blank" className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Ver produto">
                        <Eye className="h-4 w-4" />
                      </a>
                      <button onClick={() => setForm(toForm(product))} className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Editar produto">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Excluir produto">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredProducts.length ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-white/50">Nenhum produto encontrado.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {form ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur">
          <form onSubmit={saveProduct} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-gold/25 bg-[#070604] text-white shadow-[0_28px_90px_rgba(0,0,0,.75)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/15 bg-black px-5 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Cadastro de produto</p>
                <h2 className="mt-1 text-2xl font-black">{form.id ? "Editar produto" : "Novo produto"}</h2>
              </div>
              <button type="button" onClick={() => setForm(null)} className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-white hover:border-gold hover:text-gold">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-5">
              <div className="rounded-md border border-gold/15 bg-black/35 p-4">
                <p className="text-xs font-semibold leading-6 text-white/60">
                  Preencha o essencial. O sistema organiza automaticamente os códigos, links e informações da vitrine.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Nome do perfume" value={form.name} onChange={(event) => update("name", event.target.value)} />
                <select value={form.brandId} onChange={(event) => changeBrand(event.target.value)} className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm font-semibold text-white outline-none focus:border-gold">
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <Input placeholder="Preço de venda" value={form.price} onChange={(event) => update("price", event.target.value)} />
                <Input placeholder="Preço promocional, se houver" value={form.salePrice} onChange={(event) => update("salePrice", event.target.value)} />
                <Input placeholder="Estoque" type="number" value={form.stock} onChange={(event) => update("stock", event.target.value)} />
                <Input placeholder="Volume" value={form.volume} onChange={(event) => update("volume", event.target.value)} />
              </div>

              <label className="grid cursor-pointer place-items-center border border-dashed border-gold/30 p-6 text-center text-sm text-white/65 transition hover:border-gold">
                {uploading ? <Loader2 className="mb-3 h-6 w-6 animate-spin text-gold" /> : <ImagePlus className="mb-3 h-6 w-6 text-gold" />}
                {uploading ? "Convertendo para WEBP..." : "Enviar imagens do produto"}
                <span className="mt-2 text-xs text-white/42">JPG, PNG, WEBP ou GIF. O site salva tudo leve em WEBP.</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => uploadImages(event.target.files)} />
              </label>

              {form.mainImage ? (
                <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
                  <div className="relative h-28 w-28 overflow-hidden border border-gold/18 bg-black">
                    <Image src={form.mainImage} alt="Imagem principal" fill sizes="112px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Imagem principal selecionada</p>
                    <p className="mt-1 break-all text-xs text-white/45">{form.mainImage}</p>
                  </div>
                </div>
              ) : null}

              <textarea placeholder="Resumo para aparecer no catálogo" value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} className="min-h-20 rounded-md border border-gold/18 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold" />
              <textarea placeholder="Descrição completa do produto" value={form.description} onChange={(event) => update("description", event.target.value)} className="min-h-40 rounded-md border border-gold/18 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold" />

              <div className="grid gap-3 md:grid-cols-4">
                <label className="flex items-center justify-between border border-gold/18 bg-black p-4 text-sm md:col-span-1">
                  Visível
                  <input type="checkbox" checked={form.status === "ACTIVE"} onChange={(event) => update("status", event.target.checked ? "ACTIVE" : "DRAFT")} className="accent-gold" />
                </label>
                {(["featured", "bestSeller", "isNew"] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between border border-gold/18 bg-black p-4 text-sm">
                    <span>{key === "featured" ? "Destaque" : key === "bestSeller" ? "Mais vendido" : "Novidade"}</span>
                    <input type="checkbox" checked={form[key]} onChange={(event) => update(key, event.target.checked)} className="accent-gold" />
                  </label>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gold/15 bg-black p-5">
              <button type="button" onClick={() => setForm(null)} className="h-11 rounded-full border border-gold/25 px-6 text-[10px] font-black uppercase tracking-[0.14em] text-white hover:border-gold">
                Cancelar
              </button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Salvar produto
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
