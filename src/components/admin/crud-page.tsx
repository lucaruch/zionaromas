import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CrudPage({
  title,
  description,
  columns,
  rows,
  fields,
  actionLabel = "Novo cadastro",
  showAction = true,
  showEditor = true
}: {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
  fields: string[];
  actionLabel?: string;
  showAction?: boolean;
  showEditor?: boolean;
}) {
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold/70">Gestão</p>
          <h1 className="mt-3 font-display text-5xl text-white">{title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/58">{description}</p>
        </div>
        {showAction ? <Button><Plus className="h-4 w-4" /> {actionLabel}</Button> : null}
      </div>
      <div className={showEditor ? "grid gap-6 xl:grid-cols-[1fr_360px]" : "grid gap-6"}>
        <div className="overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
          <div className="grid border-b border-gold/15 bg-black px-4 py-3 text-sm font-black text-gold" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((column) => <span key={column}>{column}</span>)}
          </div>
          {rows.map((row) => (
            <div key={row.join("-")} className="grid border-b border-gold/10 px-4 py-4 text-sm text-white/70 last:border-0" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
              {row.map((cell) => <span key={cell} className="truncate pr-3">{cell}</span>)}
            </div>
          ))}
        </div>
        {showEditor ? (
          <form className="h-max border border-gold/18 bg-[#0d0b08] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
            <h2 className="font-display text-3xl text-white">Editor</h2>
            <div className="mt-5 grid gap-3">
              {fields.map((field) => (
                <Input key={field} placeholder={field} />
              ))}
              <label className="grid cursor-pointer place-items-center border border-dashed border-gold/25 p-6 text-center text-sm text-white/50 hover:border-gold">
                <Upload className="mb-2 h-5 w-5 text-gold" />
                Upload múltiplo de imagens
                <input type="file" multiple className="hidden" />
              </label>
              <textarea placeholder="Descrição rica / conteúdo institucional" className="min-h-32 rounded-3xl border border-gold/20 bg-black p-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold" />
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
