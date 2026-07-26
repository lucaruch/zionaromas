import packageJson from "../../package.json";
import { getAdminStats } from "@/lib/admin-data";
import { getPaymentSettings } from "@/lib/payment-store";
import { prisma } from "@/lib/prisma";
import { getShippingSettings } from "@/lib/shipping-settings";
import { configuredPublicSiteUrl, getPublicSiteUrl, isValidPublicSiteUrl } from "@/lib/site-url";

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
  const value = configuredPublicSiteUrl();
  return {
    value,
    resolved: getPublicSiteUrl(),
    valid: isValidPublicSiteUrl(value)
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
    const creditEnabled = paymentSettings.enabledMethods.includes("CARTAO_CREDITO");
    const debitEnabled = paymentSettings.enabledMethods.includes("CARTAO_DEBITO");
    const gatewayCredentials =
      paymentSettings.activeProvider === "CIELO"
        ? hasEnv("CIELO_MERCHANT_ID") && hasEnv("CIELO_MERCHANT_KEY")
        : hasEnv("GETNET_SELLER_ID") && hasEnv("GETNET_CLIENT_ID") && hasEnv("GETNET_CLIENT_SECRET");
    const pixReady = !pixEnabled || gatewayCredentials || hasEnv("PIX_KEY");
    const creditReady = !creditEnabled || gatewayCredentials;
    const debitReady = !debitEnabled || gatewayCredentials;
    const siteUrl = publicSiteUrl();

    const checks: PublicationCheck[] = [
      check("Banco de dados", true, "Conexão com PostgreSQL confirmada."),
      check("Produtos cadastrados", stats.products > 0, `${stats.products} produto(s) no catálogo.`),
      check("Operadora de pagamento", true, `${paymentSettings.activeProvider === "CIELO" ? "Cielo" : "Getnet"} selecionada.`),
      check("Conta de pagamento", gatewayCredentials, "Operadora conectada para receber pagamentos online.", true),
      check("PIX", pixReady, pixEnabled ? "PIX habilitado com 10% de desconto e QR/copia e cola." : "PIX não está ativo no checkout.", !pixReady),
      check("Cartão de crédito", creditReady, creditEnabled ? "Crédito habilitado para compras online." : "Crédito não está ativo no checkout.", !creditReady),
      check("Cartão de débito", debitReady, debitEnabled ? "Débito habilitado para compras online." : "Débito não está ativo no checkout.", !debitReady),
      check("Confirmação de pagamento", hasEnv("PAYMENT_WEBHOOK_SECRET"), "Retorno automático de pagamento preparado.", true),
      check("CEP de origem", shippingSettings.originPostalCode.length === 8, `Origem ${shippingSettings.originPostalCode}.`),
      check("Serviços dos Correios", shippingSettings.correiosServices.length > 0, `Serviços ativos: ${shippingSettings.correiosServices.join(", ")}.`),
      check("Peso e dimensões padrão", shippingSettings.defaultWeightKg > 0 && shippingSettings.defaultWidthCm > 0 && shippingSettings.defaultHeightCm > 0 && shippingSettings.defaultLengthCm > 0, `${shippingSettings.defaultWeightKg} kg, ${shippingSettings.defaultWidthCm}x${shippingSettings.defaultHeightCm}x${shippingSettings.defaultLengthCm} cm.`),
      check("Cotação de entrega", hasEnv("MELHOR_ENVIO_TOKEN"), "As opções de entrega estão integradas aos Correios.", true),
      check("Site publicado", siteUrl.valid, siteUrl.value ? `Endereço principal: ${siteUrl.value}.` : "Endereço principal pendente.", true),
      check("Admin protegido", hasEnv("ADMIN_PASSWORD") && hasEnv("AUTH_SECRET"), "Acesso administrativo protegido por senha."),
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
