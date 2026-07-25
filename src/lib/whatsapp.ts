// WhatsApp Deep Link Generator
// Format pesan dan generate link WhatsApp untuk pre-order

const WHATSAPP_NUMBER = "6285872066832";

export interface OrderDataPaket1 {
  paket: "super_power";
}

export interface OrderDataPaket2 {
  paket: "invitation";
  nama: string;
  email: string;
  whatsapp: string;
  durasi: number;
  harga: number;
  voucherCode: string | null;
  diskon: number;
  totalBayar: number;
}

export type OrderData = OrderDataPaket1 | OrderDataPaket2;

function formatTanggal(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRupiahWA(angka: number): string {
  return angka.toLocaleString("id-ID");
}

export function formatOrderMessage(data: OrderData): string {
  if (data.paket === "super_power") {
    return [
      "📦 *PRE-ORDER - DevTech AI Store*",
      "━━━━━━━━━━━━━━━━",
      "📋 Paket: Super Power (18 Bulan)",
      "💵 Harga: Rp55.000",
      "━━━━━━━━━━━━━━━━",
      "",
      "Halo, saya ingin membeli Paket Super Power Google AI Pro 18 Bulan.",
      "",
      `📅 ${formatTanggal()}`,
    ].join("\n");
  }

  // Paket Invitation
  const lines = [
    "📦 *PRE-ORDER - DevTech AI Store*",
    "━━━━━━━━━━━━━━━━",
    `👤 Nama: ${data.nama}`,
    `📧 Email: ${data.email}`,
    `📱 WhatsApp: ${data.whatsapp}`,
    "━━━━━━━━━━━━━━━━",
    "📋 Paket: Invitation (Family Invite)",
    `⏱️ Durasi: ${data.durasi} bulan`,
    `💰 Harga: Rp${formatRupiahWA(data.harga)}`,
  ];

  if (data.voucherCode && data.diskon > 0) {
    lines.push(`🎫 Voucher: ${data.voucherCode} (-Rp${formatRupiahWA(data.diskon)})`);
  }

  lines.push(
    `💵 *Total: Rp${formatRupiahWA(data.totalBayar)}*`,
    "━━━━━━━━━━━━━━━━",
    "",
    `📅 ${formatTanggal()}`
  );

  return lines.join("\n");
}

export function generateWhatsAppLink(data: OrderData): string {
  const message = formatOrderMessage(data);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
