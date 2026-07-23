"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminBanner, AdminCategory } from "@/lib/admin-data";

type CategoryForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

type BannerForm = AdminBanner;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminCategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [form, setForm] = useState<CategoryForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/categorias", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name) })
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("Não foi possível salvar a marca.");
      return;
    }
    setForm(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta marca?")) return;
    const response = await fetch(`/api/admin/categorias?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Não foi possível excluir. Verifique se há produtos vinculados.");
      return;
    }
    router.refresh();
  }

  return (
    <ResourceShell
      title="Marcas"
      eyebrow="Gestão de catálogo"
      description="Organize as marcas de perfumes árabes exibidas na loja."
      count={`${categories.length} marcas`}
      actionLabel="Adicionar marca"
      onAction={() => setForm({ id: "", name: "", slug: "", description: "", image: "" })}
      message={message}
    >
      <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-[1fr_1fr_1fr_120px]">
        <span>Marca</span>
        <span>Slug</span>
        <span>Produtos</span>
        <span className="text-right">Ações</span>
      </div>
      {categories.map((category) => (
        <div key={category.id} className="grid gap-3 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-[1fr_1fr_1fr_120px] md:items-center">
          <strong>{category.name}</strong>
          <span className="text-white/60">{category.slug}</span>
          <span className="text-gold">{category.productCount}</span>
          <RowActions onEdit={() => setForm({ id: category.id, name: category.name, slug: category.slug, description: category.description ?? "", image: category.image ?? "" })} onDelete={() => remove(category.id)} />
        </div>
      ))}
      {!categories.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhuma marca cadastrada.</p> : null}
      {form ? (
        <Editor title={form.id ? "Editar marca" : "Nova marca"} saving={saving} onClose={() => setForm(null)} onSubmit={save}>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.id ? form.slug : slugify(event.target.value) })} placeholder="Nome da marca" />
          <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} placeholder="Link amigável" />
          <Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Imagem" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descrição" className="min-h-28 rounded-md border border-gold/18 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold" />
        </Editor>
      ) : null}
    </ResourceShell>
  );
}

export function AdminBannersManager({ banners }: { banners: AdminBanner[] }) {
  const router = useRouter();
  const [form, setForm] = useState<BannerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/banners", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("Não foi possível salvar o banner.");
      return;
    }
    setForm(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este banner?")) return;
    const response = await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Não foi possível excluir o banner.");
      return;
    }
    router.refresh();
  }

  return (
    <ResourceShell
      title="Banners"
      eyebrow="Vitrine da loja"
      description="Atualize chamadas principais, imagens de destaque e links estratégicos."
      count={`${banners.length} banners`}
      actionLabel="Adicionar banner"
      onAction={() => setForm({ id: "", title: "", subtitle: "", image: "", ctaLabel: "", ctaHref: "", location: "home", active: true, sortOrder: 0 })}
      message={message}
    >
      <div className="grid border-b border-gold/15 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-gold/70 md:grid-cols-[1.2fr_.8fr_.8fr_.6fr_120px]">
        <span>Título</span>
        <span>Local</span>
        <span>Botão</span>
        <span>Status</span>
        <span className="text-right">Ações</span>
      </div>
      {banners.map((banner) => (
        <div key={banner.id} className="grid gap-3 border-b border-gold/10 px-5 py-5 text-sm text-white last:border-0 md:grid-cols-[1.2fr_.8fr_.8fr_.6fr_120px] md:items-center">
          <strong>{banner.title}</strong>
          <span className="text-white/60">{banner.location}</span>
          <span className="text-white/60">{banner.ctaLabel || "Sem botão"}</span>
          <span className="text-gold">{banner.active ? "Ativo" : "Inativo"}</span>
          <RowActions onEdit={() => setForm(banner)} onDelete={() => remove(banner.id)} />
        </div>
      ))}
      {!banners.length ? <p className="px-5 py-8 text-center text-sm text-white/50">Nenhum banner cadastrado.</p> : null}
      {form ? (
        <Editor title={form.id ? "Editar banner" : "Novo banner"} saving={saving} onClose={() => setForm(null)} onSubmit={save}>
          <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título" />
          <Input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="Texto de apoio" />
          <Input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Imagem" />
          <Input value={form.ctaLabel} onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })} placeholder="Texto do botão" />
          <Input value={form.ctaHref} onChange={(event) => setForm({ ...form, ctaHref: event.target.value })} placeholder="Link de destino" />
          <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Local de exibição" />
          <Input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} placeholder="Ordem" />
          <label className="flex h-11 items-center justify-between rounded-md border border-gold/18 bg-black px-4 text-sm">
            Banner ativo
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="accent-gold" />
          </label>
        </Editor>
      ) : null}
    </ResourceShell>
  );
}

function ResourceShell({
  title,
  eyebrow,
  description,
  count,
  actionLabel,
  message,
  onAction,
  children
}: {
  title: string;
  eyebrow: string;
  description: string;
  count: string;
  actionLabel: string;
  message: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
      <div className="flex flex-col justify-between gap-4 border-b border-gold/15 px-5 py-5 md:flex-row md:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold/70">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/55">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-max rounded-full bg-white/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold">{count}</span>
          <Button size="sm" onClick={onAction}><Plus className="h-4 w-4" /> {actionLabel}</Button>
        </div>
      </div>
      {message ? <p className="border-b border-gold/10 px-5 py-3 text-sm text-gold">{message}</p> : null}
      {children}
    </section>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onEdit} className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Editar">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-full border border-gold/18 text-white transition hover:border-gold hover:text-gold" aria-label="Excluir">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Editor({
  title,
  saving,
  onClose,
  onSubmit,
  children
}: {
  title: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur">
      <form onSubmit={onSubmit} className="w-full max-w-lg border border-gold/25 bg-[#070604] text-white shadow-[0_28px_90px_rgba(0,0,0,.75)]">
        <div className="flex items-center justify-between border-b border-gold/15 bg-black px-5 py-5">
          <h2 className="text-2xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-gold/25 text-white hover:border-gold hover:text-gold">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-gold/15 bg-black p-5">
          <button type="button" onClick={onClose} className="h-11 rounded-full border border-gold/25 px-6 text-[10px] font-black uppercase tracking-[0.14em] text-white hover:border-gold">
            Cancelar
          </button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
