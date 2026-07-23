import packageJson from "../../package.json";
import { getAdminStats } from "@/lib/admin-data";
import { getPaymentSettings } from "@/lib/payment-store";
import { prisma } from "@/lib/prisma";
import { getShippingSettings } from "@/lib/shipping-settings";

export type PublicationCheck = {
  label: string;
  status: "ok" | "warning" | "pending";
  detail: string;
};

export type PublicationStatus = {
  ok: boolean;
  version: string;
  commit: string;
  generatedAt: string;
  checks: PublicationCheck[];
};

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

function publicSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  return {
    value,
    valid: /^https:\/\/[^/]+/i.test(value) && !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value)
  };
}

function commitSha() {
  return (
    process.env.SOURCE_COMMIT ||
    process.env.COOLIFY_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    "local"
  );
}

function check(label: string, passed: boolean, detail: string, warning = false): PublicationCheck {
  return {
    label,
    status: passed ? "ok" : warning ? "warning" : "pending",
    detail
  };
}

export async function getPublicationStatus(): Promise<PublicationStatus> {
  const generatedAt = new Date().toISOString();
  const version = packageJson.version;

  try {
    const [stats, paymentSettings, shippingSettings] = await Promise.all([
      getAdminStats(),
      getPaymentSettings(),
      getShippingSettings()
    ]);
    await prisma.$queryRaw`SELECT 1`;

    const pixEnabled = paymentSettings.enabledMethods.includes("PIX");
    const boletoEnabled = paymentSettings.enabledMethods.includes("BOLETO");
    const cardEnabled = paymentSettings.enabledMethods.includes("CARTAO");
    const gatewayCredentials =
      paymentSettings.activeProvider === "CIELO"
        ? hasEnv("CIELO_MERCHANT_ID") && hasEnv("CIELO_MERCHANT_KEY")
        : hasEnv("GETNET_SELLER_ID") && hasEnv("GETNET_CLIENT_ID") && hasEnv("GETNET_CLIENT_SECRET");
    const pixReady = !pixEnabled || gatewayCredentials || hasEnv("PIX_KEY");
    const boletoReady = !boletoEnabled || gatewayCredentials;
    const cardReady = !cardEnabled || gatewayCredentials;
    const siteUrl = publicSiteUrl();

    const checks: PublicationCheck[] = [
      check("Banco de dados", true, "Conexão com PostgreSQL confirmada."),
      check("Produtos cadastrados", stats.products > 0, `${stats.products} produto(s) no catálogo.`),
      check("Operadora de pagamento", true, `${paymentSettings.activeProvider === "CIELO" ? "Cielo" : "Getnet"} selecionada.`),
      check("Credenciais do gateway", gatewayCredentials, "Credenciais de produção/homologação precisam estar nas variáveis da Coolify.", true),
      check("PIX", pixReady, pixEnabled ? "PIX habilitado com QR/copia e cola quando houver chave ou gateway." : "PIX não está ativo no checkout.", !pixReady),
      check("Cartão", cardReady, cardEnabled ? "Cartão depende de credenciais e teste real no gateway." : "Cartão não está ativo no checkout.", !cardReady),
      check("Boleto", boletoReady, boletoEnabled ? "Boleto depende de credenciais e contratação no gateway." : "Boleto não está ativo no checkout.", !boletoReady),
      check("Webhook de pagamento", hasEnv("PAYMENT_WEBHOOK_SECRET"), "/api/webhooks/payment protegido por segredo.", true),
      check("CEP de origem", shippingSettings.originPostalCode.length === 8, `Origem ${shippingSettings.originPostalCode}.`),
      check("Serviços dos Correios", shippingSettings.correiosServices.length > 0, `Serviços ativos: ${shippingSettings.correiosServices.join(", ")}.`),
      check("Peso e dimensões padrão", shippingSettings.defaultWeightKg > 0 && shippingSettings.defaultWidthCm > 0 && shippingSettings.defaultHeightCm > 0 && shippingSettings.defaultLengthCm > 0, `${shippingSettings.defaultWeightKg} kg, ${shippingSettings.defaultWidthCm}x${shippingSettings.defaultHeightCm}x${shippingSettings.defaultLengthCm} cm.`),
      check("Melhor Envio", hasEnv("MELHOR_ENVIO_TOKEN"), "Token necessário para cotações reais dos Correios.", true),
      check("Site público", siteUrl.valid, siteUrl.value ? `URL configurada: ${siteUrl.value}.` : "URL pública ainda não configurada.", true),
      check("Admin protegido", hasEnv("ADMIN_PASSWORD") && hasEnv("AUTH_SECRET"), "Senha do admin e segredo de sessão configurados."),
      check("Contatos da loja", true, "WhatsApp, e-mail, Instagram, Maps, CNPJ e razão social estão no site."),
      check("Compra teste", false, "Precisa ser executada no ambiente publicado com gateway real.", true)
    ];

    return {
      ok: checks.every((item) => item.status === "ok"),
      version,
      commit: commitSha(),
      generatedAt,
      checks
    };
  } catch {
    return {
      ok: false,
      version,
      commit: commitSha(),
      generatedAt,
      checks: [
        {
          label: "Banco de dados",
          status: "pending",
          detail: "Não foi possível confirmar a conexão com o PostgreSQL."
        }
      ]
    };
  }
}
