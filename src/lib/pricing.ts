// Pricing Data & Logic
// Data harga, daftar fitur resmi Google AI Pro, dan kalkulasi diskon

// ============================================
// HARGA PAKET
// ============================================

export const PAKET_SUPER_POWER = {
  id: "super_power",
  nama: "Super Power",
  deskripsi: "Paket 18 Bulan (Aktivasi Mandiri)",
  durasi: 18,
  hargaAsli: 75000,
  hargaPromo: 55000,
  proses: [
    "Klik tombol 'Pilih Paket' untuk menghubungi kami via WhatsApp",
    "Selesaikan pembayaran via QRIS / Transfer",
    "Anda akan menerima link aktivasi resmi dari kami",
    "Buka link di browser → klik Aktifkan pada akun Google Anda",
    "Selesai! Paket AI Pro aktif 18 bulan di akun Anda",
  ],
  keunggulan: [
    "Masa aktif 18 bulan penuh",
    "Tidak perlu login & password (akun Anda sendiri)",
    "Subscription langsung aktif pada akun Google Anda",
    "Tidak perlu metode pembayaran / kartu kredit",
    "Anda bisa mengundang hingga 5 anggota keluarga (Family Sharing)",
  ],
} as const;

export const HARGA_INVITATION: Record<number, number> = {
  1: 15000,
  2: 20000,
  3: 25000,
  4: 30000,
  5: 33000,
  6: 35000,
  7: 38000,
  8: 40000,
  9: 43000,
  10: 45000,
  11: 48000,
  12: 50000,
};

export const PAKET_INVITATION = {
  id: "invitation",
  nama: "Invitation",
  deskripsi: "Paket Fleksibel (Via Undangan Google Family)",
  proses: [
    "Klik tombol 'Pilih Paket' dan isi form data Anda",
    "Data pesanan Anda akan terkirim ke WhatsApp kami",
    "Selesaikan pembayaran via QRIS / Transfer",
    "Kami akan mengirim undangan Google Family ke email Anda",
    "Buka email → Terima undangan → AI Pro langsung aktif!",
  ],
  keunggulan: [
    "Durasi fleksibel 1-12 bulan sesuai kebutuhan",
    "Tidak perlu login & password (akun Anda sendiri)",
    "Tinggal terima invitation lewat email",
    "Tidak perlu metode pembayaran / kartu kredit",
  ],
} as const;

// ============================================
// FITUR RESMI GOOGLE AI PRO 2026
// ============================================

export const FITUR_AI_PRO = [
  {
    icon: "🧠",
    judul: "Gemini 3.1 Pro",
    deskripsi:
      "Model AI terkuat dari Google dengan kemampuan reasoning mendalam untuk analisis kompleks, pemrograman, dan pemecahan masalah tingkat lanjut.",
  },
  {
    icon: "🔬",
    judul: "Gemini Deep Research",
    deskripsi:
      "Agen riset otonom yang melakukan investigasi multi-langkah, menjelajahi web & data Google Workspace Anda, lalu menyusun laporan komprehensif lengkap dengan sumber.",
  },
  {
    icon: "🎨",
    judul: "Image & Video Generation",
    deskripsi:
      "Buat gambar dan video berkualitas tinggi dari teks. Didukung Veo 3.1 untuk konten visual profesional dan sinematik.",
  },
  {
    icon: "📧",
    judul: "Workspace Intelligence",
    deskripsi:
      "AI terintegrasi penuh ke Gmail, Docs, Sheets, Slides, Drive, dan Calendar. Otomatisasi draf email, rangkum dokumen, dan ekstrak insight secara real-time.",
  },
  {
    icon: "🤖",
    judul: "Gemini Spark Agent",
    deskripsi:
      "Asisten AI yang bertindak atas nama Anda untuk kelola kalender, booking jadwal, unsubscribe email, dan kirim reminder secara otomatis.",
  },
  {
    icon: "📓",
    judul: "Gemini Notebook (NotebookLM)",
    deskripsi:
      "Ruang riset interaktif: unggah dokumen untuk mendapatkan insight instan, mind map, dan Audio Overview seperti podcast.",
  },
  {
    icon: "🎬",
    judul: "Canvas Mode",
    deskripsi:
      "Edit Docs & Slides langsung dalam antarmuka Gemini tanpa berpindah tab. Interface interaktif untuk kreasi konten yang lebih cepat.",
  },
  {
    icon: "💼",
    judul: "Custom Gems",
    deskripsi:
      "Buat asisten AI khusus untuk tugas berulang seperti analisis data, coding, atau proses bisnis spesifik Anda.",
  },
  {
    icon: "☁️",
    judul: "5 TB Cloud Storage",
    deskripsi:
      "Penyimpanan cloud besar yang dibagikan ke seluruh ekosistem Google seperti Drive, Gmail, dan Photos.",
  },
  {
    icon: "⚡",
    judul: "Limit Token Hemat & Refresh Cepat",
    deskripsi:
      "Limit token berlapis ganda untuk pemakaian intensif. Kuota refresh otomatis setiap 5 jam, ideal untuk programmer yang sering coding dengan Antigravity IDE dan tools AI coding lainnya.",
  },
  {
    icon: "📦",
    judul: "Context Window 1 Juta Token",
    deskripsi:
      "Analisis ratusan halaman dokumen, ribuan baris kode, hingga video panjang dalam satu sesi. Tidak ada detail yang terlewat.",
  },
] as const;

// ============================================
// KALKULASI HARGA
// ============================================

export interface DiskonResult {
  valid: boolean;
  potongan: number;
  totalBayar: number;
  message: string;
}

export function hitungDiskon(
  hargaAsli: number,
  voucherType: "percentage" | "fixed" | null,
  voucherValue: number
): DiskonResult {
  if (!voucherType) {
    return {
      valid: false,
      potongan: 0,
      totalBayar: hargaAsli,
      message: "",
    };
  }

  let potongan = 0;
  if (voucherType === "percentage") {
    potongan = Math.floor((hargaAsli * voucherValue) / 100);
  } else {
    potongan = voucherValue;
  }

  // Potongan tidak boleh melebihi harga
  potongan = Math.min(potongan, hargaAsli);

  return {
    valid: true,
    potongan,
    totalBayar: hargaAsli - potongan,
    message:
      voucherType === "percentage"
        ? `Diskon ${voucherValue}% (-Rp${potongan.toLocaleString("id-ID")})`
        : `Potongan Rp${potongan.toLocaleString("id-ID")}`,
  };
}

export function formatRupiah(angka: number): string {
  return `Rp${angka.toLocaleString("id-ID")}`;
}
