import QRCode from "qrcode";

function tlv(id: string, value: string) {
  const normalized = value.slice(0, 99);
  return `${id}${String(normalized.length).padStart(2, "0")}${normalized}`;
}

function onlyPixSafe(value: string, max: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, "")
    .trim()
    .slice(0, max);
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

export async function createPixPayload({
  key,
  merchantName,
  merchantCity,
  amount,
  txid,
  description
}: {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
  description?: string;
}) {
  const merchantAccount = [
    tlv("00", "br.gov.bcb.pix"),
    tlv("01", key.trim()),
    description ? tlv("02", onlyPixSafe(description, 72)) : ""
  ].join("");
  const withoutCrc = [
    tlv("00", "01"),
    tlv("26", merchantAccount),
    tlv("52", "0000"),
    tlv("53", "986"),
    tlv("54", amount.toFixed(2)),
    tlv("58", "BR"),
    tlv("59", onlyPixSafe(merchantName || "ZION AROMAS", 25)),
    tlv("60", onlyPixSafe(merchantCity || "PRAIA GRANDE", 15)),
    tlv("62", tlv("05", onlyPixSafe(txid, 25))),
    "6304"
  ].join("");
  const code = `${withoutCrc}${crc16(withoutCrc)}`;
  const image = await QRCode.toDataURL(code, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });

  return { code, image };
}
