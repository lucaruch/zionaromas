import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { getPaymentSettings } from "@/lib/payment-store";
import { getShippingSettings } from "@/lib/shipping-settings";

export default async function AdminSettingsPage() {
  const [paymentSettings, shippingSettings] = await Promise.all([
    getPaymentSettings(),
    getShippingSettings()
  ]);

  return (
    <div className="grid gap-6">
      <PaymentSettingsForm initialSettings={paymentSettings} />
      <ShippingSettingsForm initialSettings={shippingSettings} />

      <section className="grid gap-4 border border-gold/18 bg-[#0d0b08] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,.24)] sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold/75">Informações da boutique</p>
        <h2 className="font-display text-3xl">Dados exibidos no site</h2>
        <div className="grid gap-3 text-sm text-white/62">
          <p>WhatsApp: (13) 99756-6750</p>
          <p>E-mail: zionaromasp@gmail.com</p>
          <p>Avenida Presidente Costa e Silva, 501 - Galeria PG - Ljs 70/75 - Boqueirão - Praia Grande - SP</p>
          <p>CNPJ: 66.976.436/0001-29 | ZION AROMAS PERFUMARIA LTDA</p>
        </div>
      </section>
    </div>
  );
}
