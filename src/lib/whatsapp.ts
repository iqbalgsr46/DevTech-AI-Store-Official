// WhatsApp Deep Link Generator
// Format pesan dan generate link WhatsApp untuk pre-order dengan Unicode escape agar 100% kompatibel di semua OS/browser

const WHATSAPP_NUMBER = "6285872066832";

// Unicode Escape Sequences untuk Emoji agar bebas dari masalah encoding file/OS (Windows/Linux/Vercel)
const EMOJI = {
  PACKAGE: "\u{1F4E6}",   // 📦
  USER: "\u{1F464}",      // 👤
  EMAIL: "\u{1F4E7}",     // 📧
  PHONE: "\u{1F4F1}",     // 📱
  CLIPBOARD: "\u{1F4CB}", // 📋
  TIMER: "\u{23F1}\u{FE0F}", // ⏱️
  MONEY: "\u{1F4B0}",     // 💰
  TICKET: "\u{1F39F}",    // 🎫
  CASH: "\u{1F4B5}",      // 💵
  CALENDAR: "\u{1F4C5}",  // 📅
};

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
      `${EMOJI.PACKAGE} *PRE-ORDER - DevTech AI Store*`,
      "━━━━━━━━━━━━━━━━",
      `${EMOJI.USER} *Nama:* ${data.nama}`,
      "━━━━━━━━━━━━━━━━",
      `${EMOJI.CLIPBOARD} *Paket:* Super Power (18 Bulan)`,
      `${EMOJI.MONEY} *Harga:* Rp${formatRupiahWA(data.harga)}`,
    ];

    if (data.voucherCode && data.diskon > 0) {
      p1Lines.push(`${EMOJI.TICKET} *Voucher:* ${data.voucherCode} (-Rp${formatRupiahWA(data.diskon)})`);
    }

    p1Lines.push(
      `${EMOJI.CASH} *Total:* Rp${formatRupiahWA(data.totalBayar)}`,
      "━━━━━━━━━━━━━━━━",
      "",
      "Halo, saya ingin membeli Paket Super Power Google AI Pro 18 Bulan.",
      "",
      `${EMOJI.CALENDAR} ${formatTanggal()}`
    );

    return p1Lines.join("\n");
  }

  // Paket Invitation
  const lines = [
    `${EMOJI.PACKAGE} *PRE-ORDER - DevTech AI Store*`,
    "━━━━━━━━━━━━━━━━",
    `${EMOJI.USER} *Nama:* ${data.nama}`,
    `${EMOJI.EMAIL} *Email:* ${data.email}`,
    `${EMOJI.PHONE} *WhatsApp:* ${data.whatsapp}`,
    "━━━━━━━━━━━━━━━━",
    `${EMOJI.CLIPBOARD} *Paket:* Invitation (Family Invite)`,
    `${EMOJI.TIMER} *Durasi:* ${data.durasi} Bulan`,
    `${EMOJI.MONEY} *Harga:* Rp${formatRupiahWA(data.harga)}`,
  ];

  if (data.voucherCode && data.diskon > 0) {
    lines.push(`${EMOJI.TICKET} *Voucher:* ${data.voucherCode} (-Rp${formatRupiahWA(data.diskon)})`);
  }

  lines.push(
    `${EMOJI.CASH} *Total:* Rp${formatRupiahWA(data.totalBayar)}`,
    "━━━━━━━━━━━━━━━━",
    "",
    "Halo, saya ingin membeli Paket Invitation Google AI Pro.",
    "",
    `${EMOJI.CALENDAR} ${formatTanggal()}`
  );

  return lines.join("\n");
}

export function generateWhatsAppLink(data: OrderData): string {
  const message = formatOrderMessage(data);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
