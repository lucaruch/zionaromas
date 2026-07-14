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
          <p className="text-xs uppercase tracking-[0.18em] text-gold-deep">Gestão</p>
          <h1 className="mt-3 font-display text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-black/60">{description}</p>
        </div>
        {showAction ? <Button><Plus className="h-4 w-4" /> {actionLabel}</Button> : null}
      </div>
      <div className={showEditor ? "grid gap-6 xl:grid-cols-[1fr_360px]" : "grid gap-6"}>
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="grid border-b border-black/10 bg-black px-4 py-3 text-sm font-semibold text-white" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((column) => <span key={column}>{column}</span>)}
          </div>
          {rows.map((row) => (
            <div key={row.join("-")} className="grid border-b border-black/5 px-4 py-4 text-sm last:border-0" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
              {row.map((cell) => <span key={cell} className="truncate pr-3">{cell}</span>)}
            </div>
          ))}
        </div>
        {showEditor ? (
          <form className="h-max rounded-lg border border-black/10 bg-white p-5">
            <h2 className="font-display text-3xl">Editor</h2>
            <div className="mt-5 grid gap-3">
              {fields.map((field) => (
                <Input key={field} placeholder={field} />
              ))}
              <label className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-black/20 p-6 text-center text-sm text-black/50 hover:border-gold">
                <Upload className="mb-2 h-5 w-5 text-gold-deep" />
                Upload múltiplo de imagens
                <input type="file" multiple className="hidden" />
              </label>
              <textarea placeholder="Descrição rica / conteúdo institucional" className="min-h-32 rounded-3xl border border-black/10 p-4 text-sm outline-none focus:border-gold" />
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
