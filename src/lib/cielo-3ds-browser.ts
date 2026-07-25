export type Cielo3dsAuthResult = {
  Cavv?: string | null;
  Xid?: string | null;
  Eci?: string | null;
  Version?: string | null;
  ReferenceId?: string | null;
  ReturnCode?: string | null;
  ReturnMessage?: string | null;
};

export type Cielo3dsExternalAuth = {
  cavv?: string;
  xid?: string;
  eci: string;
  version?: string;
  referenceId?: string;
};

type MpiHandlers = {
  onReady?: () => void;
  onSuccess?: (data: Cielo3dsAuthResult) => void;
  onFailure?: (data: Cielo3dsAuthResult) => void;
  onUnenrolled?: (data: Cielo3dsAuthResult) => void;
  onDisabled?: (data?: Cielo3dsAuthResult) => void;
  onError?: (data: Cielo3dsAuthResult) => void;
  onUnsupportedBrand?: (data: Cielo3dsAuthResult) => void;
  onChallengeSuppression?: (data?: Cielo3dsAuthResult) => void;
};

type BpmpiWindow = Window & {
  bpmpi_config?: () => Record<string, unknown>;
  bpmpi_authenticate?: () => void;
  bpmpi_load?: () => void;
  __zionBpmpiHandlers?: MpiHandlers;
  __zionBpmpiEnv?: "PRD" | "SDB";
  __zionBpmpiReady?: boolean;
  __zionBpmpiScriptLoading?: Promise<void>;
};

const SCRIPT_SRC = "/js/BP.Mpi.3ds20.min.js";

const CHALLENGE_HINT =
  "Confirme a compra na janela do seu banco (3DS). Se nada aparecer, desative bloqueador de anúncios/pop-up e tente de novo.";

function getWin(): BpmpiWindow {
  return window as BpmpiWindow;
}

function ensureConfig(environment: "PRD" | "SDB") {
  const win = getWin();
  if (!win.__zionBpmpiHandlers) {
    win.__zionBpmpiHandlers = {};
  }

  // bpmpi_config é lido uma vez no carregamento do script — handlers mutáveis.
  if (!win.bpmpi_config) {
    win.__zionBpmpiEnv = environment;
    win.bpmpi_config = () => {
      const handlers = win.__zionBpmpiHandlers || {};
      return {
        Environment: win.__zionBpmpiEnv || environment,
        Debug: false,
        onReady: () => {
          win.__zionBpmpiReady = true;
          handlers.onReady?.();
        },
        onSuccess: (data: Cielo3dsAuthResult) => handlers.onSuccess?.(data),
        onFailure: (data: Cielo3dsAuthResult) => handlers.onFailure?.(data),
        onUnenrolled: (data: Cielo3dsAuthResult) => handlers.onUnenrolled?.(data),
        onDisabled: (data?: Cielo3dsAuthResult) => handlers.onDisabled?.(data),
        onError: (data: Cielo3dsAuthResult) => handlers.onError?.(data),
        onUnsupportedBrand: (data: Cielo3dsAuthResult) => handlers.onUnsupportedBrand?.(data),
        onChallengeSuppression: (data?: Cielo3dsAuthResult) => handlers.onChallengeSuppression?.(data)
      };
    };
  }
}

function ensureContainer() {
  let root = document.getElementById("zion-bpmpi-fields");
  if (!root) {
    root = document.createElement("div");
    root.id = "zion-bpmpi-fields";
    root.style.display = "none";
    root.setAttribute("aria-hidden", "true");
    document.body.appendChild(root);
  }
  return root;
}

function setField(root: HTMLElement, className: string, value: string) {
  let input = root.querySelector<HTMLInputElement>(`input.${className}`);
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.className = className;
    root.appendChild(input);
  }
  input.value = value;
}

function clearCartFields(root: HTMLElement) {
  root.querySelectorAll('input[class*="bpmpi_cart_"]').forEach((node) => node.remove());
}

function showChallengeHint() {
  if (document.getElementById("zion-3ds-challenge-hint")) return;
  const hint = document.createElement("div");
  hint.id = "zion-3ds-challenge-hint";
  hint.setAttribute("role", "status");
  const text = document.createElement("span");
  text.textContent = CHALLENGE_HINT;
  hint.appendChild(text);
  document.body.appendChild(hint);
}

function hideChallengeHint() {
  document.getElementById("zion-3ds-challenge-hint")?.remove();
}

export type Cielo3dsFieldPayload = {
  accessToken: string;
  orderNumber: string;
  amountCents: number;
  installments: number;
  paymentMethod: "Credit" | "Debit";
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  customerName: string;
  customerEmail: string;
  customerDocument: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipcode: string;
  merchantUrl: string;
  items: Array<{ name: string; sku: string; quantity: number; unitPriceCents: number }>;
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "5513999999999";
  if (digits.startsWith("55") && digits.length >= 12) return digits.slice(0, 15);
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits.slice(0, 15);
}

export function populateBpmpiFields(payload: Cielo3dsFieldPayload) {
  const root = ensureContainer();
  clearCartFields(root);

  setField(root, "bpmpi_auth", "true");
  setField(root, "bpmpi_auth_suppresschallenge", "false");
  // 05 = tela cheia — reduz chance do desafio ficar escondido atrás do layout.
  setField(root, "bpmpi_challenge_window_size", "05");
  setField(root, "bpmpi_accesstoken", payload.accessToken);
  setField(root, "bpmpi_ordernumber", payload.orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50));
  setField(root, "bpmpi_currency", "BRL");
  setField(root, "bpmpi_totalamount", String(Math.max(1, Math.round(payload.amountCents))));
  setField(root, "bpmpi_installments", String(Math.max(1, Math.min(12, payload.installments))));
  setField(root, "bpmpi_paymentmethod", payload.paymentMethod);
  setField(root, "bpmpi_cardnumber", payload.cardNumber.replace(/\D/g, ""));
  setField(root, "bpmpi_cardexpirationmonth", payload.expirationMonth.padStart(2, "0").slice(0, 2));
  setField(root, "bpmpi_cardexpirationyear", payload.expirationYear.slice(0, 4));
  setField(root, "bpmpi_default_card", "false");
  setField(root, "bpmpi_order_productcode", "PHY");
  setField(root, "bpmpi_transaction_mode", "S");
  setField(root, "bpmpi_merchant_url", payload.merchantUrl.slice(0, 100));
  setField(root, "bpmpi_billto_customerid", payload.customerDocument.replace(/\D/g, "").slice(0, 14));
  setField(root, "bpmpi_billto_contactname", payload.customerName.slice(0, 120));
  setField(root, "bpmpi_billto_phonenumber", normalizePhone(payload.phone));
  setField(root, "bpmpi_billto_email", payload.customerEmail.slice(0, 255));
  setField(root, "bpmpi_billto_street1", payload.street1.slice(0, 60));
  setField(root, "bpmpi_billto_street2", (payload.street2 || "Centro").slice(0, 60));
  setField(root, "bpmpi_billto_city", (payload.city || "Praia Grande").slice(0, 50));
  setField(root, "bpmpi_billto_state", (payload.state || "SP").toUpperCase().slice(0, 2));
  setField(root, "bpmpi_billto_zipcode", payload.zipcode.replace(/\D/g, "").slice(0, 8));
  setField(root, "bpmpi_billto_country", "BR");
  setField(root, "bpmpi_shipto_sameasbillto", "true");
  setField(root, "bpmpi_device_channel", "Browser");

  payload.items.slice(0, 10).forEach((item, index) => {
    const n = index + 1;
    setField(root, `bpmpi_cart_${n}_name`, item.name.slice(0, 255));
    setField(root, `bpmpi_cart_${n}_description`, item.name.slice(0, 255));
    setField(root, `bpmpi_cart_${n}_sku`, item.sku.slice(0, 255));
    setField(root, `bpmpi_cart_${n}_quantity`, String(item.quantity));
    setField(root, `bpmpi_cart_${n}_unitprice`, String(Math.max(0, Math.round(item.unitPriceCents))));
  });
}

async function loadBpmpiScript(environment: "PRD" | "SDB") {
  const win = getWin();
  ensureConfig(environment);

  if (typeof win.bpmpi_authenticate === "function") {
    return;
  }

  if (win.__zionBpmpiScriptLoading) {
    await win.__zionBpmpiScriptLoading;
    return;
  }

  win.__zionBpmpiScriptLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      const check = () => {
        if (typeof win.bpmpi_authenticate === "function") resolve();
        else setTimeout(check, 50);
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o script 3DS."));
    document.body.appendChild(script);
  });

  await win.__zionBpmpiScriptLoading;
}

function waitForReady(timeoutMs = 20_000) {
  const win = getWin();
  if (win.__zionBpmpiReady) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(
        new Error(
          "Tempo esgotado ao iniciar o 3DS. Verifique bloqueadores de anúncio e tente novamente."
        )
      );
    }, timeoutMs);

    const handlers = win.__zionBpmpiHandlers || (win.__zionBpmpiHandlers = {});
    const previous = handlers.onReady;
    handlers.onReady = () => {
      window.clearTimeout(timer);
      handlers.onReady = previous;
      previous?.();
      resolve();
    };
  });
}

/** ECI de autenticação bem-sucedida ou tentativa (liability shift / attempt). */
function isSuccessfulOrAttemptedEci(eci: string) {
  const normalized = eci.replace(/\D/g, "").padStart(2, "0");
  return normalized === "01" || normalized === "02" || normalized === "05" || normalized === "06";
}

function authResultToExternal(
  data: Cielo3dsAuthResult | undefined,
  options?: { requireSuccess?: boolean }
): Cielo3dsExternalAuth | null {
  if (!data) return null;
  const eci = data.Eci != null ? String(data.Eci).trim() : "";
  if (!eci) return null;
  if (options?.requireSuccess && !isSuccessfulOrAttemptedEci(eci)) return null;

  return {
    eci,
    cavv: data.Cavv ? String(data.Cavv) : undefined,
    xid: data.Xid ? String(data.Xid) : undefined,
    version: data.Version != null ? String(data.Version) : "2",
    referenceId: data.ReferenceId ? String(data.ReferenceId) : undefined
  };
}

const CHALLENGE_FAILED_MESSAGE =
  "A verificação do banco (3DS) não foi concluída. Se a janela do banco não abriu, desative bloqueador de anúncios/pop-up, recarregue a página e tente de novo.";

export async function runCielo3dsAuthentication(
  environment: "PRD" | "SDB",
  fields: Cielo3dsFieldPayload
): Promise<Cielo3dsExternalAuth> {
  const win = getWin();
  ensureConfig(environment);
  populateBpmpiFields(fields);

  // Anexa onReady antes do script para evitar corrida com o bpmpi_load() automático.
  const readyPromise = win.__zionBpmpiReady ? Promise.resolve() : waitForReady();
  await loadBpmpiScript(environment);
  await readyPromise;

  if (typeof win.bpmpi_authenticate !== "function") {
    throw new Error("Script 3DS não disponível.");
  }

  // Token é removido do DOM no load; repor campos atualizados antes de autenticar.
  populateBpmpiFields(fields);

  return new Promise<Cielo3dsExternalAuth>((resolve, reject) => {
    const handlers = win.__zionBpmpiHandlers || (win.__zionBpmpiHandlers = {});
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(CHALLENGE_FAILED_MESSAGE));
    }, 180_000);

    showChallengeHint();

    const finishOk = (data: Cielo3dsAuthResult) => {
      const external = authResultToExternal(data, { requireSuccess: true });
      cleanup();
      if (external) {
        resolve(external);
        return;
      }
      reject(new Error(data.ReturnMessage || CHALLENGE_FAILED_MESSAGE));
    };

    const finishSoft = (data: Cielo3dsAuthResult) => {
      // Sem desafio/falha: só segue se houver ECI de attempt/sucesso + CAVV quando disponível.
      const external = authResultToExternal(data, { requireSuccess: true });
      cleanup();
      if (external && (external.cavv || external.referenceId)) {
        resolve(external);
        return;
      }
      reject(new Error(data.ReturnMessage || CHALLENGE_FAILED_MESSAGE));
    };

    const finishError = (data?: Cielo3dsAuthResult) => {
      cleanup();
      reject(new Error(data?.ReturnMessage || CHALLENGE_FAILED_MESSAGE));
    };

    function cleanup() {
      window.clearTimeout(timer);
      hideChallengeHint();
      handlers.onSuccess = undefined;
      handlers.onFailure = undefined;
      handlers.onUnenrolled = undefined;
      handlers.onDisabled = undefined;
      handlers.onError = undefined;
      handlers.onUnsupportedBrand = undefined;
      handlers.onChallengeSuppression = undefined;
    }

    handlers.onSuccess = finishOk;
    handlers.onFailure = finishSoft;
    handlers.onUnenrolled = finishSoft;
    handlers.onDisabled = finishError;
    handlers.onError = finishError;
    handlers.onUnsupportedBrand = finishError;
    handlers.onChallengeSuppression = () => {
      cleanup();
      reject(
        new Error(
          "O desafio 3DS do banco foi bloqueado. Desative bloqueadores e tente novamente."
        )
      );
    };

    try {
      win.bpmpi_authenticate!();
    } catch (error) {
      cleanup();
      reject(error instanceof Error ? error : new Error("Falha ao iniciar autenticação 3DS."));
    }
  });
}

export async function fetchCielo3dsToken(): Promise<{ accessToken: string; environment: "PRD" | "SDB" }> {
  const response = await fetch("/api/checkout/3ds-token", { cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Não foi possível iniciar a autenticação 3DS."
    );
  }

  const accessToken = typeof data.accessToken === "string" ? data.accessToken : "";
  const environment = data.environment === "SDB" ? "SDB" : "PRD";
  if (!accessToken) {
    throw new Error("Token 3DS vazio.");
  }

  return { accessToken, environment };
}
