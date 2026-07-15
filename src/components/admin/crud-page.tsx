import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CrudPage({
  title,
  description,
  columns,
  rows,
  fields,
  actionLabel = "Adicionar item",
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
    <div className="min-w-0">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold/70">Gestão</p>
          <h1 className="mt-3 break-words font-display text-4xl text-white sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/58">{description}</p>
        </div>
        {showAction ? (
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> {actionLabel}
          </Button>
        ) : null}
      </div>
      <div className={showEditor ? "grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" : "grid min-w-0 gap-6"}>
        <div className="min-w-0 overflow-hidden border border-gold/18 bg-[#0d0b08] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid border-b border-gold/15 bg-black px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-gold/90" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
                {columns.map((column) => <span key={column}>{column}</span>)}
              </div>
              {rows.map((row) => (
                <div key={row.join("-")} className="grid border-b border-gold/10 px-4 py-4 text-sm text-white/70 last:border-0" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
                  {row.map((cell) => <span key={cell} className="truncate pr-3">{cell}</span>)}
                </div>
              ))}
            </div>
          </div>
        </div>
        {showEditor ? (
          <form className="h-max min-w-0 border border-gold/18 bg-[#0d0b08] p-4 shadow-[0_18px_50px_rgba(0,0,0,.28)] sm:p-5">
            <h2 className="font-display text-3xl text-white">Detalhes</h2>
            <div className="mt-5 grid gap-3">
              {fields.map((field) => (
                <Input key={field} placeholder={field} />
              ))}
              <label className="grid cursor-pointer place-items-center border border-dashed border-gold/25 p-6 text-center text-sm text-white/50 transition hover:border-gold hover:text-gold">
                <Upload className="mb-2 h-5 w-5 text-gold" />
                Adicionar imagens
                <input type="file" multiple className="hidden" />
              </label>
              <textarea placeholder="Descrição, observações ou texto da página" className="min-h-32 rounded-2xl border border-gold/20 bg-black p-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold" />
              <Button type="submit">Salvar informações</Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
