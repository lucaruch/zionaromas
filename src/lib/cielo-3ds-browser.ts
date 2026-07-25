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
  __zionBpmpiReload?: boolean;
  __zionBpmpiInitAmount?: number;
  __zionBpmpiAccessToken?: string;
  Cardinal?: unknown;
};

const SCRIPT_SRC = "/js/BP.Mpi.3ds20.min.js?v=20260725d";

const READY_TIMEOUT_MS = 25_000;
const AUTH_TIMEOUT_MS = 90_000;

const CHALLENGE_HINT =
  "Confirme a compra na janela do banco. Se não aparecer em alguns segundos, desative o bloqueador de anúncios e tente de novo.";

const STUCK_MESSAGE =
  "A janela do banco (3DS) não abriu a tempo. Desative bloqueador de anúncios, recarregue com Ctrl+F5 e tente novamente.";

function getWin(): BpmpiWindow {
  return window as BpmpiWindow;
}

function ensureConfig(environment: "PRD" | "SDB") {
  const win = getWin();
  if (!win.__zionBpmpiHandlers) {
    win.__zionBpmpiHandlers = {};
  }

  // Sempre atualiza o ambiente antes do primeiro load.
  win.__zionBpmpiEnv = environment;

  // bpmpi_config é lido uma vez no carregamento do script — handlers mutáveis.
  if (!win.bpmpi_config) {
    win.bpmpi_config = () => {
      const handlers = win.__zionBpmpiHandlers || {};
      return {
        Environment: win.__zionBpmpiEnv || environment,
        Debug: true,
        onReady: () => {
          win.__zionBpmpiReady = true;
          console.info("[ZION 3DS] MPI pronto (onReady)");
          handlers.onReady?.();
        },
        onSuccess: (data: Cielo3dsAuthResult) => {
          console.info("[ZION 3DS] onSuccess", data);
          handlers.onSuccess?.(data);
        },
        onFailure: (data: Cielo3dsAuthResult) => {
          console.warn("[ZION 3DS] onFailure", data);
          handlers.onFailure?.(data);
        },
        onUnenrolled: (data: Cielo3dsAuthResult) => {
          console.warn("[ZION 3DS] onUnenrolled", data);
          handlers.onUnenrolled?.(data);
        },
        onDisabled: (data?: Cielo3dsAuthResult) => {
          console.warn("[ZION 3DS] onDisabled", data);
          handlers.onDisabled?.(data);
        },
        onError: (data: Cielo3dsAuthResult) => {
          console.error("[ZION 3DS] onError", data);
          handlers.onError?.(data);
        },
        onUnsupportedBrand: (data: Cielo3dsAuthResult) => {
          console.error("[ZION 3DS] onUnsupportedBrand", data);
          handlers.onUnsupportedBrand?.(data);
        },
        onChallengeSuppression: (data?: Cielo3dsAuthResult) => {
          console.warn("[ZION 3DS] onChallengeSuppression", data);
          handlers.onChallengeSuppression?.(data);
        }
      };
    };
  }
}

function ensureContainer() {
  let root = document.getElementById("zion-bpmpi-fields");
  if (!root) {
    root = document.createElement("div");
    root.id = "zion-bpmpi-fields";
    // Não usar display:none — alguns browsers/scripts ignoram inputs em nós display:none.
    root.style.position = "absolute";
    root.style.width = "1px";
    root.style.height = "1px";
    root.style.overflow = "hidden";
    root.style.clip = "rect(0 0 0 0)";
    root.style.clipPath = "inset(50%)";
    root.style.whiteSpace = "nowrap";
    root.style.border = "0";
    root.style.padding = "0";
    root.style.margin = "-1px";
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
  customerIp?: string;
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
  const customerIp = (payload.customerIp || "").trim();

  setField(root, "bpmpi_auth", "true");
  setField(root, "bpmpi_auth_suppresschallenge", "false");
  // 03 = 500x600 — tamanho comum de desafio ACS
  setField(root, "bpmpi_challenge_window_size", "03");
  setField(root, "bpmpi_accesstoken", payload.accessToken);
  setField(root, "bpmpi_ordernumber", payload.orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50));
  setField(root, "bpmpi_currency", "BRL");
  setField(root, "bpmpi_totalamount", String(Math.round(payload.amountCents)));
  setField(root, "bpmpi_installments", String(Math.max(1, Math.min(12, payload.installments))));
  setField(root, "bpmpi_paymentmethod", payload.paymentMethod);
  setField(root, "bpmpi_cardnumber", payload.cardNumber.replace(/\D/g, ""));
  setField(root, "bpmpi_cardexpirationmonth", payload.expirationMonth.padStart(2, "0").slice(0, 2));
  setField(root, "bpmpi_cardexpirationyear", payload.expirationYear.slice(0, 4));
  setField(root, "bpmpi_default_card", "false");
  setField(root, "bpmpi_order_productcode", "PHY");
  setField(root, "bpmpi_order_recurrence", "false");
  setField(root, "bpmpi_order_countlast24hours", "1");
  setField(root, "bpmpi_order_countlast6months", "1");
  setField(root, "bpmpi_order_countlast1year", "1");
  setField(root, "bpmpi_order_cardattemptslast24hours", "1");
  setField(root, "bpmpi_transaction_mode", "S");
  setField(root, "bpmpi_merchant_newcustomer", "true");
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
  setField(root, "bpmpi_useraccount_guest", "true");
  if (customerIp) {
    setField(root, "bpmpi_device_ipaddress", customerIp.slice(0, 45));
  }
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
      const started = Date.now();
      const check = () => {
        if (typeof win.bpmpi_authenticate === "function") {
          resolve();
          return;
        }
        if (Date.now() - started > 10_000) {
          reject(new Error("Script 3DS não inicializou."));
          return;
        }
        setTimeout(check, 50);
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o script 3DS."));
    document.body.appendChild(script);
  });

  await win.__zionBpmpiScriptLoading;
}

function waitForReady(timeoutMs = READY_TIMEOUT_MS) {
  const win = getWin();
  if (win.__zionBpmpiReady) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const handlers = win.__zionBpmpiHandlers || (win.__zionBpmpiHandlers = {});
    const previousReady = handlers.onReady;
    const previousError = handlers.onError;

    const timer = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Tempo esgotado ao iniciar o 3DS (Cardinal). Desative bloqueador de anúncios, use Ctrl+F5 e tente de novo."
        )
      );
    }, timeoutMs);

    function cleanup() {
      window.clearTimeout(timer);
      handlers.onReady = previousReady;
      handlers.onError = previousError;
    }

    handlers.onReady = () => {
      cleanup();
      previousReady?.();
      resolve();
    };

    handlers.onError = (data) => {
      cleanup();
      previousError?.(data);
      const msg = data?.ReturnMessage || "";
      const code = data?.ReturnCode || "";
      reject(
        new Error(
          code || msg
            ? `Falha no 3DS (${code || "erro"}): ${msg || "sem detalhes"}. Confira o valor do pedido e tente de novo.`
            : "Falha ao iniciar o 3DS (Cardinal/Braspag)."
        )
      );
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

export async function runCielo3dsAuthentication(
  environment: "PRD" | "SDB",
  fields: Cielo3dsFieldPayload
): Promise<Cielo3dsExternalAuth> {
  if (!Number.isFinite(fields.amountCents) || fields.amountCents < 100) {
    throw new Error("Valor do pedido inválido para 3DS. Recarregue o carrinho e tente de novo.");
  }

  const win = getWin();
  ensureConfig(environment);
  populateBpmpiFields(fields);

  console.info("[ZION 3DS] amountCents=", fields.amountCents, "order=", fields.orderNumber, "tokenLen=", fields.accessToken.length);

  const tokenInput = document.querySelector<HTMLInputElement>("input.bpmpi_accesstoken");
  if (!fields.accessToken || fields.accessToken.length < 20) {
    throw new Error("Token 3DS inválido antes de iniciar o MPI.");
  }
  if (tokenInput) {
    tokenInput.value = fields.accessToken;
  }
  // Fallback se o DOM não for lido pelo script MPI (classe/timing).
  win.__zionBpmpiAccessToken = fields.accessToken;

  // Se o MPI já iniciou com outro valor, força re-init (senão enroll dá 403).
  const needsReload =
    Boolean(win.__zionBpmpiReady) &&
    win.__zionBpmpiInitAmount != null &&
    win.__zionBpmpiInitAmount !== fields.amountCents;

  if (needsReload) {
    win.__zionBpmpiReload = true;
    win.__zionBpmpiReady = false;
  }

  const readyPromise = win.__zionBpmpiReady ? Promise.resolve() : waitForReady();
  await loadBpmpiScript(environment);

  // Script não faz auto-load — iniciamos só com token/valor corretos no DOM.
  if (!win.__zionBpmpiReady && typeof win.bpmpi_load === "function") {
    win.bpmpi_load();
  } else if (needsReload && typeof win.bpmpi_load === "function") {
    win.bpmpi_load();
  }

  await readyPromise;
  win.__zionBpmpiInitAmount = fields.amountCents;

  if (typeof win.bpmpi_authenticate !== "function") {
    throw new Error("Script 3DS não disponível.");
  }

  // Repor campos (cartão/valor) imediatamente antes do authenticate.
  populateBpmpiFields(fields);

  return new Promise<Cielo3dsExternalAuth>((resolve, reject) => {
    const handlers = win.__zionBpmpiHandlers || (win.__zionBpmpiHandlers = {});
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(STUCK_MESSAGE));
    }, AUTH_TIMEOUT_MS);

    showChallengeHint();
    console.info("[ZION 3DS] Chamando bpmpi_authenticate()");

    const finishOk = (data: Cielo3dsAuthResult) => {
      const external = authResultToExternal(data, { requireSuccess: true });
      cleanup();
      if (external) {
        resolve(external);
        return;
      }
      reject(new Error(data.ReturnMessage || STUCK_MESSAGE));
    };

    const finishSoft = (data: Cielo3dsAuthResult) => {
      const external = authResultToExternal(data, { requireSuccess: true });
      cleanup();
      if (external && (external.cavv || external.referenceId)) {
        resolve(external);
        return;
      }
      reject(new Error(data.ReturnMessage || STUCK_MESSAGE));
    };

    const finishError = (data?: Cielo3dsAuthResult) => {
      cleanup();
      const msg = data?.ReturnMessage || "";
      const code = data?.ReturnCode || "";
      reject(
        new Error(
          code || msg
            ? `Falha no 3DS (${code || "erro"}): ${msg || "sem detalhes"}. Tente novamente ou use PIX.`
            : STUCK_MESSAGE
        )
      );
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
      reject(new Error("O desafio 3DS do banco foi bloqueado. Desative bloqueadores e tente novamente."));
    };

    // Libera o event loop para o overlay/hint pintar antes do desafio.
    window.setTimeout(() => {
      try {
        win.bpmpi_authenticate!();
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error("Falha ao iniciar autenticação 3DS."));
      }
    }, 50);
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
