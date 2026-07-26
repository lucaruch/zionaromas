import QRCode from "qrcode";

function tlv(id: string, value: string) {
  const normalized = value;
  const length = new TextEncoder().encode(normalized).length;
  return `${id}${String(length).padStart(2, "0")}${normalized}`;
}

function onlyPixSafe(value: string, max: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .toUpperCase();
}

function normalizePixKey(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 11 || digits.length === 14) return digits;
  if (trimmed.startsWith("+") && digits.length >= 12 && digits.length <= 13) return `+${digits}`;
  if (trimmed.includes("@")) return trimmed.toLowerCase();

  return trimmed;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function isValidPixPayload(value: unknown) {
  if (typeof value !== "string") return false;

  const code = value.trim();
  if (!code.startsWith("000201") || !code.includes("br.gov.bcb.pix") || code.length < 80) return false;

  const crcIndex = code.lastIndexOf("6304");
  if (crcIndex < 0 || crcIndex + 8 !== code.length) return false;

  const withoutChecksum = code.slice(0, crcIndex + 4);
  const checksum = code.slice(crcIndex + 4).toUpperCase();
  return /^[0-9A-F]{4}$/.test(checksum) && crc16(withoutChecksum) === checksum;
}

export async function createPixPayload({
  key,
  merchantName,
  merchantCity,
  amount,
  txid
}: {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
  description?: string;
}) {
  const safeKey = normalizePixKey(key);
  const safeName = onlyPixSafe(merchantName || "ZION AROMAS", 25) || "ZION AROMAS";
  const safeCity = onlyPixSafe(merchantCity || "PRAIA GRANDE", 15) || "PRAIA GRANDE";
  const safeTxid = onlyPixSafe(txid, 25) || "***";
  if (!safeKey || safeKey.length < 5) {
    throw new Error("Chave PIX invalida.");
  }

  const merchantAccount = [
    tlv("00", "br.gov.bcb.pix"),
    tlv("01", safeKey)
  ].join("");
  const withoutCrc = [
    tlv("00", "01"),
    tlv("26", merchantAccount),
    tlv("52", "0000"),
    tlv("53", "986"),
    tlv("54", amount.toFixed(2)),
    tlv("58", "BR"),
    tlv("59", safeName),
    tlv("60", safeCity),
    tlv("62", tlv("05", safeTxid)),
    "6304"
  ].join("");
  const code = `${withoutCrc}${crc16(withoutCrc)}`;
  const image = await createQrCodeImage(code);

  return { code, image };
}

export async function createQrCodeImage(code: string) {
  return QRCode.toDataURL(code, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });
}
