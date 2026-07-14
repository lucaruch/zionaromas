"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { Eye, Pencil, Package, Search, SlidersHorizontal, ShoppingBag, Trash2, MessageSquare, Ticket, Plus, X, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Produtos" value={String(products.length)} icon={Package} />
        <StatCard label="Pedidos abertos" value="3" icon={ShoppingBag} />
        <StatCard label="Mensagens novas" value="3" icon={MessageSquare} />
        <StatCard label="Cupons ativos" value="2" icon={Ticket} />
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
            <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Adicionar produto</Button>
          </div>
        </div>

        <div className="grid gap-2 border-b border-gold/15 bg-black/35 p-4 md:grid-cols-[1fr_160px_152px]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white/45">
            <Search className="h-4 w-4" />
            <input className="w-full bg-transparent outline-none placeholder:text-white/40" placeholder="Buscar nome, marca ou SKU" />
          </label>
          <label className="flex h-10 items-center gap-3 rounded-md border border-gold/18 bg-black px-3 text-sm text-white">
            <SlidersHorizontal className="h-4 w-4 text-gold" />
            <select className="w-full bg-transparent font-semibold outline-none">
              <option>Todos</option>
              <option>Perfumes</option>
              <option>Kits</option>
            </select>
          </label>
          <select className="h-10 rounded-md border border-gold/18 bg-black px-3 text-sm font-semibold text-white outline-none">
            <option>Todos os status</option>
            <option>Ativo</option>
            <option>Rascunho</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gold/15 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">
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
                <tr key={product.slug} className="border-b border-gold/10 text-white last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden border border-gold/15 bg-black">
                        <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover opacity-80" />
                      </div>
                      <div>
                        <p className="font-black">{product.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/42">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/70">{product.category}</td>
                  <td className="px-5 py-4 text-sm font-black text-gold">{formatCurrency(product.salePrice ?? product.price)}</td>
                  <td className="px-5 py-4 text-sm">
                    <strong className={product.stock <= 3 ? "text-red-400" : "text-white"}>{product.stock}</strong>{" "}
                    <span className="text-[10px] uppercase text-white/42">un.</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-[10px] font-black uppercase text-emerald-300">
                      Ativo
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {[Eye, Pencil, Trash2].map((Icon, index) => (
                        <button
                          key={index}
                          className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold"
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

      {modalOpen ? <ProductModal onClose={() => setModalOpen(false)} /> : null}
    </div>
  );
}

function ProductModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur">
      <form className="max-h-[92vh] w-full max-w-xl overflow-y-auto border border-gold/25 bg-[#070604] text-white shadow-[0_28px_90px_rgba(0,0,0,.75)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/15 bg-black px-5 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">Gestão de catálogo</p>
            <h2 className="mt-1 text-2xl font-black">Novo produto</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-white hover:border-gold hover:text-gold">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-6 p-5">
          <Fieldset title="Informações principais">
            <InputLike placeholder="Ex.: Sultan Oud Premium" className="md:col-span-2" />
            <InputLike placeholder="Marca" />
            <SelectLike options={["Perfumes Árabes", "Oud & Amadeirados", "Florais Orientais", "Kits Presente"]} />
            <textarea placeholder="Descrição curta" className="min-h-24 rounded-md border border-gold/18 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold md:col-span-2" />
          </Fieldset>
          <Fieldset title="Peso e dimensões para frete">
            <InputLike placeholder="Largura (cm)" />
            <InputLike placeholder="Altura (cm)" />
            <InputLike placeholder="Comprimento (cm)" />
            <InputLike placeholder="Peso (kg)" />
          </Fieldset>
          <Fieldset title="Venda e estoque">
            <InputLike placeholder="Preço de venda (R$)" />
            <InputLike placeholder="Preço anterior (R$)" />
            <InputLike placeholder="Estoque" />
            <InputLike placeholder="SKU" />
          </Fieldset>
          <Fieldset title="Variações e imagem">
            <InputLike placeholder="Tamanhos / volumes" />
            <InputLike placeholder="Cores ou famílias" />
            <label className="grid cursor-pointer place-items-center border border-dashed border-gold/30 p-8 text-center text-sm text-white/55 transition hover:border-gold md:col-span-2">
              <Upload className="mb-3 h-6 w-6 text-gold" />
              Arraste as fotos aqui
              <span className="mt-2 rounded-full border border-gold/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">Escolher na pasta</span>
              <input type="file" multiple className="hidden" />
            </label>
          </Fieldset>
          <Fieldset title="Publicação">
            <label className="flex items-center justify-between border border-gold/18 bg-black p-4 text-sm">
              <span><strong>Produto ativo</strong><small className="mt-1 block text-white/45">Visível para venda</small></span>
              <input type="checkbox" defaultChecked className="accent-gold" />
            </label>
            <label className="flex items-center justify-between border border-gold/18 bg-black p-4 text-sm">
              <span><strong>Em destaque</strong><small className="mt-1 block text-white/45">Aparece na seleção inicial</small></span>
              <input type="checkbox" className="accent-gold" />
            </label>
          </Fieldset>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gold/15 bg-black p-5">
          <button type="button" onClick={onClose} className="h-11 rounded-full border border-gold/25 px-6 text-[10px] font-black uppercase tracking-[0.14em] text-white hover:border-gold">
            Cancelar
          </button>
          <Button type="submit"><Check className="h-4 w-4" /> Cadastrar produto</Button>
        </div>
      </form>
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-t border-gold/15 pt-4 md:grid-cols-2">
      <legend className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-gold">{title}</legend>
      {children}
    </fieldset>
  );
}

function InputLike({ placeholder, className = "" }: { placeholder: string; className?: string }) {
  return <input placeholder={placeholder} className={`h-11 rounded-md border border-gold/18 bg-black px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold ${className}`} />;
}

function SelectLike({ options }: { options: string[] }) {
  return (
    <select className="h-11 rounded-md border border-gold/18 bg-black px-4 text-sm font-semibold text-white outline-none focus:border-gold">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}
