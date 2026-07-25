"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Tag, AlertCircle } from "lucide-react";
import { HARGA_INVITATION, formatRupiah, hitungDiskon } from "@/lib/pricing";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { validateVoucher, VoucherValidationResult } from "@/lib/database";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  paketType: "super_power" | "invitation";
  basePrice?: number | string;
}

const STEPS = ["Pilih Durasi", "Isi Data", "Konfirmasi"];

export default function OrderModal({ isOpen, onClose, paketType, basePrice }: OrderModalProps) {
  // Step state (Skip step 0 for super_power)
  const [step, setStep] = useState(paketType === "super_power" ? 1 : 0);

  // Step 1: Durasi
  const [durasi, setDurasi] = useState<number>(1);

  // Step 2: Data
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Voucher
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherResult, setVoucherResult] = useState<VoucherValidationResult | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Computed
  const harga = paketType === "super_power" ? (Number(basePrice) || 55000) : (HARGA_INVITATION[durasi] || 15000);
  const diskonInfo = voucherResult?.valid && voucherResult.voucher
    ? hitungDiskon(harga, voucherResult.voucher.type, voucherResult.voucher.value)
    : null;
  const totalBayar = diskonInfo ? diskonInfo.totalBayar : harga;

  const resetForm = useCallback(() => {
    setStep(paketType === "super_power" ? 1 : 0);
    setDurasi(1);
    setNama("");
    setEmail("");
    setWhatsapp("");
    setVoucherInput("");
    setVoucherResult(null);
  }, [paketType]);

  // Reset state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleValidateVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherLoading(true);
    try {
      const result = await validateVoucher(voucherInput.trim());
      setVoucherResult(result);
    } catch {
      setVoucherResult({
        valid: false,
        voucher: null,
        message: "Gagal memvalidasi voucher. Periksa koneksi internet.",
      });
    }
    setVoucherLoading(false);
  };

  const handleSubmit = () => {
    const link = generateWhatsAppLink({
      paket: paketType,
      nama,
      email,
      whatsapp,
      durasi: paketType === "super_power" ? 18 : durasi,
      harga,
      voucherCode: voucherResult?.valid ? voucherInput.toUpperCase() : null,
      diskon: diskonInfo?.potongan || 0,
      totalBayar,
    });
    window.open(link, "_blank");
    handleClose();
  };

  const canProceedStep1 = durasi >= 1 && durasi <= 12;
  const canProceedStep2 = nama.trim() !== "" && email.trim() !== "" && whatsapp.trim() !== "";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[28px] w-full max-w-[460px] max-h-[90vh] overflow-y-auto shadow-2xl z-10"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md rounded-t-[28px] px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 z-20">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">
                  Pre-Order Paket {paketType === "super_power" ? "Super Power" : "Invitation"}
                </h2>
                {/* Progress Steps */}
                <div className="flex items-center gap-1.5 mt-2">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                      <div
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                          i === step
                            ? "bg-[#1E3A8A] text-white"
                            : i < step
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {i < step ? "✓" : i + 1}. {s}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-3 h-[1px] ${i < step ? "bg-emerald-300" : "bg-gray-200"}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-4">
              <AnimatePresence mode="wait">
                {/* STEP 1: Pilih Durasi */}
                {step === 0 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[13px] text-gray-500 mb-4">
                      Pilih durasi berlangganan yang sesuai kebutuhan Anda:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(HARGA_INVITATION).map(([bulan, hrg]) => {
                        const bln = parseInt(bulan);
                        const isSelected = durasi === bln;
                        return (
                          <button
                            key={bln}
                            onClick={() => setDurasi(bln)}
                            className={`relative rounded-xl p-3 border-2 transition-all text-center ${
                              isSelected
                                ? "border-[#1E3A8A] bg-blue-50 shadow-md"
                                : "border-gray-150 bg-white hover:border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                                <CheckCircle2 size={10} className="text-white" />
                              </div>
                            )}
                            <span className={`block text-[15px] font-bold ${isSelected ? "text-[#1E3A8A]" : "text-gray-800"}`}>
                              {bln} Bln
                            </span>
                            <span className={`block text-[11px] font-semibold mt-0.5 ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                              {formatRupiah(hrg)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Summary */}
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-600 font-medium">Durasi dipilih:</span>
                        <span className="text-[15px] font-bold text-[#1E3A8A]">{durasi} Bulan</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[13px] text-gray-600 font-medium">Harga:</span>
                        <span className="text-[17px] font-bold text-[#1E3A8A]">{formatRupiah(harga)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(1)}
                      disabled={!canProceedStep1}
                      className="w-full mt-4 bg-[#1E3A8A] text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#162d6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Lanjut <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: Isi Data */}
                {step === 1 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[13px] text-gray-500 mb-4">
                      Lengkapi data berikut untuk melanjutkan pre-order:
                    </p>

                    <div className="space-y-3">
                      {/* Nama */}
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-300"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                          Email Google <span className="text-gray-400 font-normal">(yang akan diundang)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh@gmail.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-300"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                          Nomor WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-300"
                        />
                      </div>

                      {/* Voucher */}
                      <div>
                        <label className="block text-[12px] font-semibold text-gray-600 mb-1">
                          Kode Voucher / Referral <span className="text-gray-400 font-normal">(opsional)</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={voucherInput}
                              onChange={(e) => {
                                setVoucherInput(e.target.value.toUpperCase());
                                setVoucherResult(null);
                              }}
                              placeholder="Masukkan kode"
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder:text-gray-300 uppercase"
                            />
                          </div>
                          <button
                            onClick={handleValidateVoucher}
                            disabled={!voucherInput.trim() || voucherLoading}
                            className="px-4 py-2.5 bg-gray-100 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          >
                            {voucherLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              "Cek"
                            )}
                          </button>
                        </div>

                        {/* Voucher Result */}
                        {voucherResult && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-2 px-3 py-2 rounded-lg flex items-center gap-2 text-[12px] font-medium ${
                              voucherResult.valid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                          >
                            {voucherResult.valid ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <AlertCircle size={14} />
                            )}
                            {voucherResult.message}
                            {diskonInfo && diskonInfo.valid && (
                              <span className="ml-auto font-bold">
                                -{formatRupiah(diskonInfo.potongan)}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => paketType === "super_power" ? handleClose() : setStep(0)}
                        className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 text-[15px]"
                      >
                        <ArrowLeft size={16} /> Kembali
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!canProceedStep2}
                        className="flex-grow bg-[#1E3A8A] text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#162d6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Lanjut <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Konfirmasi */}
                {step === 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[13px] text-gray-500 mb-4">
                      Periksa ringkasan pesanan sebelum mengirim:
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Nama</span>
                        <span className="text-gray-900 font-semibold">{nama}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-900 font-semibold">{email}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">WhatsApp</span>
                        <span className="text-gray-900 font-semibold">{whatsapp}</span>
                      </div>
                      <div className="h-[1px] bg-gray-200" />
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Paket</span>
                        <span className="text-gray-900 font-semibold">
                          {paketType === "super_power" ? "Super Power (Aktivasi Mandiri)" : "Invitation (Family)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Durasi</span>
                        <span className="text-gray-900 font-semibold">
                          {paketType === "super_power" ? 18 : durasi} Bulan
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Harga</span>
                        <span className="text-gray-900 font-semibold">{formatRupiah(harga)}</span>
                      </div>
                      {diskonInfo && diskonInfo.valid && (
                        <div className="flex justify-between text-[13px]">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Tag size={12} /> Voucher ({voucherInput})
                          </span>
                          <span className="text-emerald-600 font-bold">
                            -{formatRupiah(diskonInfo.potongan)}
                          </span>
                        </div>
                      )}
                      <div className="h-[1px] bg-gray-200" />
                      <div className="flex justify-between text-[15px]">
                        <span className="text-gray-900 font-bold">Total Bayar</span>
                        <span className="text-[#1E3A8A] font-bold text-[17px]">
                          {formatRupiah(totalBayar)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        💡 Setelah klik tombol di bawah, WhatsApp akan terbuka dengan pesan pre-order yang sudah terformat. Lanjutkan pembayaran melalui chat WhatsApp kami.
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setStep(1)}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-[14px] flex items-center gap-1 hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft size={16} /> Kembali
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="flex-grow bg-[#25D366] text-white rounded-xl py-3 font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1fb855] transition-colors shadow-lg shadow-green-200"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Kirim via WhatsApp
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
