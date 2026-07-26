// WhatsApp Deep Link Generator
// Format pesan dan generate link WhatsApp untuk pre-order

const WHATSAPP_NUMBER = "6285872066832";

export interface OrderDataPaket1 {
  paket: "super_power";
  nama: string;
  harga: number;
  voucherCode: string | null;
  diskon: number;
  totalBayar: number;
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
  const now = new Date();
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][now.getDay()];
  const tgl = now.getDate();
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ][now.getMonth()];
  const tahun = now.getFullYear();
  const jam = String(now.getHours()).padStart(2, "0");
  const menit = String(now.getMinutes()).padStart(2, "0");

  return `${hari}, ${tgl} ${bulan} ${tahun} pukul ${jam}.${menit}`;
}

function formatRupiahWA(angka: number): string {
  return angka.toLocaleString("id-ID");
}

export function formatOrderMessage(data: OrderData): string {
  if (data.paket === "super_power") {
    const p1Lines = [
      "📦 *PRE-ORDER - DevTech AI Store*",
      "━━━━━━━━━━━━━━━━",
      `👤 *Nama:* ${data.nama}`,
      "━━━━━━━━━━━━━━━━",
      "📋 *Paket:* Super Power (18 Bulan)",
      `💰 *Harga:* Rp${formatRupiahWA(data.harga)}`,
    ];

    if (data.voucherCode && data.diskon > 0) {
      p1Lines.push(`🎫 *Voucher:* ${data.voucherCode} (-Rp${formatRupiahWA(data.diskon)})`);
    }

    p1Lines.push(
      `💵 *Total:* Rp${formatRupiahWA(data.totalBayar)}`,
      "━━━━━━━━━━━━━━━━",
      "",
      "Halo, saya ingin membeli Paket Super Power Google AI Pro 18 Bulan.",
      "",
      `📅 ${formatTanggal()}`
    );

    return p1Lines.join("\n");
  }

  // Paket Invitation
  const lines = [
    "📦 *PRE-ORDER - DevTech AI Store*",
    "━━━━━━━━━━━━━━━━",
    `👤 *Nama:* ${data.nama}`,
    `📧 *Email:* ${data.email}`,
    `📱 *WhatsApp:* ${data.whatsapp}`,
    "━━━━━━━━━━━━━━━━",
    "📋 *Paket:* Invitation (Family Invite)",
    `⏱️ *Durasi:* ${data.durasi} Bulan`,
    `💰 *Harga:* Rp${formatRupiahWA(data.harga)}`,
  ];

  if (data.voucherCode && data.diskon > 0) {
    lines.push(`🎫 *Voucher:* ${data.voucherCode} (-Rp${formatRupiahWA(data.diskon)})`);
  }

  lines.push(
    `💵 *Total:* Rp${formatRupiahWA(data.totalBayar)}`,
    "━━━━━━━━━━━━━━━━",
    "",
    "Halo, saya ingin membeli Paket Invitation Google AI Pro.",
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
