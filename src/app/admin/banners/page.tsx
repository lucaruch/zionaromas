import { CrudPage } from "@/components/admin/crud-page";

export default function AdminBannersPage() {
  return (
    <CrudPage
      title="Banners"
      description="Altere banners da home, CTAs, ordem, imagem e localização."
      columns={["Título", "Local", "CTA", "Status"]}
      rows={[["Perfumes para quem deixa presença", "Home", "Explorar coleção", "Ativo"], ["Promoção Oud", "Promoções", "Comprar", "Ativo"]]}
      fields={["Título", "Subtítulo", "Imagem", "CTA label", "CTA URL", "Localização", "Ordem", "Status"]}
    />
  );
}
