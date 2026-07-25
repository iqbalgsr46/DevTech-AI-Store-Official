"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  useSubscribers,
  useVouchers,
  addSubscriber,
  updateSubscriber,
  deleteSubscriber,
  addVoucher,
  updateVoucher,
  deleteVoucher,
  checkAndExpireSubscribers,
  getSubscriberStats,
  getDaysRemaining,
  getStatusBadge,
  Subscriber,
  Voucher,
  useSettings,
  updateSettings,
  WebsiteSettings,
} from "@/lib/database";
import {
  Users,
  Tag,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Search,
  X,
  Loader2,
  RefreshCw,
  ChevronDown,
  Shield,
  AlertTriangle,
  Clock,
  Home,
  Settings,
  Save,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

// ============================================
// TOAST NOTIFICATION
// ============================================

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-slide-in flex items-center gap-2 max-w-[360px] ${
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      </div>
      {message}
    </div>
  );
}

// ============================================
// LOGIN SCREEN
// ============================================

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Email atau password salah. Pastikan akun sudah dibuat di Firebase Authentication.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">DevTech AI Store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-400"
              placeholder="admin@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-2.5 rounded-xl flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Masuk
          </button>
        </form>

        <a
          href="/"
          className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-600 text-xs mt-6 transition-colors"
        >
          <Home size={12} /> Kembali ke Halaman Utama
        </a>
      </div>
    </div>
  );
}

// ============================================
// SUBSCRIBER FORM MODAL
// ============================================

function SubscriberFormModal({
  isOpen,
  onClose,
  onSave,
  editData,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Subscriber, "id" | "createdAt">) => void;
  editData: Subscriber | null;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    whatsapp: "",
    paket: "super_power" as "super_power" | "invitation",
    durasi: 18,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "active" as "active" | "expired" | "cancelled",
    notes: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        nama: editData.nama,
        email: editData.email,
        whatsapp: editData.whatsapp,
        paket: editData.paket,
        durasi: editData.durasi,
        startDate: editData.startDate,
        endDate: editData.endDate,
        status: editData.status,
        notes: editData.notes || "",
      });
    } else {
      const today = new Date();
      const end = new Date(today);
      end.setMonth(end.getMonth() + 18);
      setForm({
        nama: "",
        email: "",
        whatsapp: "",
        paket: "super_power",
        durasi: 18,
        startDate: today.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        status: "active",
        notes: "",
      });
    }
  }, [editData, isOpen]);

  // Auto-calc endDate when startDate or durasi changes (only for new subscriber)
  useEffect(() => {
    if (!editData && form.startDate) {
      const start = new Date(form.startDate);
      if (!isNaN(start.getTime())) {
        start.setMonth(start.getMonth() + form.durasi);
        setForm((prev) => ({
          ...prev,
          endDate: start.toISOString().split("T")[0],
        }));
      }
    }
  }, [form.startDate, form.durasi, editData]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold">
            {editData ? "Edit Subscriber" : "Tambah Subscriber"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Nama subscriber"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Email Google *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@gmail.com"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Paket
              </label>
              <div className="relative">
                <select
                  value={form.paket}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paket: e.target.value as "super_power" | "invitation",
                      durasi:
                        e.target.value === "super_power" ? 18 : form.durasi,
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="super_power" className="bg-white">
                    Super Power
                  </option>
                  <option value="invitation" className="bg-white">
                    Invitation
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Durasi (Bulan)
              </label>
              <input
                type="number"
                min={1}
                max={18}
                value={form.durasi}
                onChange={(e) =>
                  setForm({ ...form, durasi: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Tanggal Berakhir
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            {editData && (
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as
                          | "active"
                          | "expired"
                          | "cancelled",
                      })
                    }
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                  >
                    <option value="active" className="bg-white">
                      Active
                    </option>
                    <option value="expired" className="bg-white">
                      Expired
                    </option>
                    <option value="cancelled" className="bg-white">
                      Cancelled
                    </option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Catatan (opsional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Tambahkan catatan..."
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            onClick={() => onSave(form)}
            disabled={!form.nama || !form.email || saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {editData ? "Simpan Perubahan" : "Tambah Subscriber"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VOUCHER FORM MODAL
// ============================================

function VoucherFormModal({
  isOpen,
  onClose,
  onSave,
  editData,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Voucher) => void;
  editData: Voucher | null;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 10,
    maxUses: 50,
    currentUses: 0,
    isActive: true,
    expiredAt: "" as string,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        code: editData.code,
        type: editData.type,
        value: editData.value,
        maxUses: editData.maxUses,
        currentUses: editData.currentUses,
        isActive: editData.isActive,
        expiredAt: editData.expiredAt || "",
      });
    } else {
      setForm({
        code: "",
        type: "percentage",
        value: 10,
        maxUses: 50,
        currentUses: 0,
        isActive: true,
        expiredAt: "",
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-[420px] border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {editData ? "Edit Voucher" : "Buat Voucher Baru"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Kode Voucher *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              disabled={!!editData}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase disabled:opacity-50 placeholder:text-slate-400"
              placeholder="Contoh: DISKON10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Tipe Diskon
              </label>
              <div className="relative">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "percentage" | "fixed",
                    })
                  }
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="percentage" className="bg-white">
                    Persen (%)
                  </option>
                  <option value="fixed" className="bg-white">
                    Nominal (Rp)
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nilai {form.type === "percentage" ? "(%)" : "(Rp)"}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Max Penggunaan
              </label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) =>
                  setForm({ ...form, maxUses: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Expired (opsional)
              </label>
              <input
                type="date"
                value={form.expiredAt}
                onChange={(e) =>
                  setForm({ ...form, expiredAt: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-emerald-500" : "bg-gray-600"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${form.isActive ? "left-5" : "left-0.5"}`}
              />
            </button>
            <span className="text-sm text-slate-600">
              {form.isActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          <button
            onClick={() =>
              onSave({
                ...form,
                expiredAt: form.expiredAt || null,
                createdAt: editData?.createdAt || Date.now(),
              })
            }
            disabled={!form.code || saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {editData ? "Simpan Perubahan" : "Buat Voucher"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REALTIME COUNTDOWN
// ============================================

function RealtimeCountdown({ endDate, daysLeft }: { endDate: string, daysLeft: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Set expiration to 23:59:59 of the endDate
    const target = new Date(`${endDate}T23:59:59`).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className={`text-[11px] font-mono mt-1 ${daysLeft <= 7 ? "text-amber-400" : "text-slate-500"}`}>
      {timeLeft}
    </div>
  );
}

// ============================================
// SETTINGS TAB COMPONENT
// ============================================

function SettingsTabContent({
  initialSettings,
  onSave,
  saving,
}: {
  initialSettings: WebsiteSettings | null;
  onSave: (data: WebsiteSettings) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<WebsiteSettings>({
    pricing: {
      paket1: { hargaNormal: "75000", hargaPromo: "55000" },
      paket2: {
        bulan1: "15000",
        bulan2: "20000",
        bulan3: "25000",
        bulan4: "30000",
        bulan5: "35000",
        bulan6: "35000",
        bulan7: "40000",
        bulan8: "40000",
        bulan9: "45000",
        bulan10: "45000",
        bulan11: "50000",
        bulan12: "50000",
      },
    },
  });

  useEffect(() => {
    if (initialSettings) {
      setForm(initialSettings);
    }
  }, [initialSettings]);

  const handlePaket1Change = (field: "hargaNormal" | "hargaPromo", value: string) => {
    setForm((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        paket1: { ...prev.pricing.paket1, [field]: value },
      },
    }));
  };

  const handlePaket2Change = (bulan: keyof WebsiteSettings["pricing"]["paket2"], value: string) => {
    setForm((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        paket2: { ...prev.pricing.paket2, [bulan]: value },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h4 className="text-slate-800 font-semibold mb-4">Paket 1 (Super Power)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Harga Normal (Dicoret)</label>
            <input
              type="text"
              value={form.pricing.paket1.hargaNormal}
              onChange={(e) => handlePaket1Change("hargaNormal", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Contoh: 75000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Harga Promo (Aktif)</label>
            <input
              type="text"
              value={form.pricing.paket1.hargaPromo}
              onChange={(e) => handlePaket1Change("hargaPromo", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Contoh: 55000"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h4 className="text-slate-800 font-semibold mb-4">Paket 2 (Invitation / Family)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const key = `bulan${m}` as keyof WebsiteSettings["pricing"]["paket2"];
            return (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{m} Bulan</label>
                <input
                  type="text"
                  value={form.pricing.paket2[key]}
                  onChange={(e) => handlePaket2Change(key, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  placeholder={`Harga ${m} bulan`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onSave(form)}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        <Save size={16} /> Simpan Pengaturan
      </button>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD (hanya render setelah login)
// ============================================

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "subscribers", label: "Subscribers", icon: Users },
  { id: "vouchers", label: "Vouchers", icon: Tag },
  { id: "settings", label: "Pengaturan", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

function DashboardContent({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Data: real-time listeners (hanya aktif setelah login)
  const { subscribers, loading: subsLoading } = useSubscribers();
  const { vouchers, loading: vouchLoading } = useVouchers();
  const { settings, loading: settingsLoading } = useSettings();

  // Modals
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subEditData, setSubEditData] = useState<Subscriber | null>(null);
  const [vouchModalOpen, setVouchModalOpen] = useState(false);
  const [vouchEditData, setVouchEditData] = useState<Voucher | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Saving state
  const [saving, setSaving] = useState(false);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    []
  );

  // Auto-expire check on mount
  useEffect(() => {
    checkAndExpireSubscribers().catch(() => {
      // silently ignore: rules may block if no data yet
    });
  }, []);

  // Stats
  const stats = useMemo(
    () => getSubscriberStats(subscribers),
    [subscribers]
  );

  // Filtered subscribers
  const filteredSubs = useMemo(() => {
    return subscribers.filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.whatsapp.includes(searchQuery);
      const matchStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  // Recent subscribers for overview
  const recentSubs = useMemo(() => subscribers.slice(0, 5), [subscribers]);

  // Handlers with error handling
  const handleSaveSubscriber = async (
    data: Omit<Subscriber, "id" | "createdAt">
  ) => {
    setSaving(true);
    try {
      if (subEditData) {
        await updateSubscriber(subEditData.id, data);
        showToast("Subscriber berhasil diperbarui", "success");
      } else {
        await addSubscriber(data);
        showToast("Subscriber berhasil ditambahkan", "success");
      }
      setSubModalOpen(false);
      setSubEditData(null);
    } catch {
      showToast("Gagal menyimpan subscriber. Cek koneksi internet.", "error");
    }
    setSaving(false);
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm("Yakin ingin menghapus subscriber ini?")) {
      try {
        await deleteSubscriber(id);
        showToast("Subscriber berhasil dihapus", "success");
      } catch {
        showToast("Gagal menghapus subscriber", "error");
      }
    }
  };

  const handleSaveVoucher = async (data: Voucher) => {
    setSaving(true);
    try {
      if (vouchEditData) {
        await updateVoucher(data.code, data);
        showToast("Voucher berhasil diperbarui", "success");
      } else {
        await addVoucher(data);
        showToast("Voucher berhasil dibuat", "success");
      }
      setVouchModalOpen(false);
      setVouchEditData(null);
    } catch {
      showToast("Gagal menyimpan voucher. Cek koneksi internet.", "error");
    }
    setSaving(false);
  };

  const handleDeleteVoucher = async (code: string) => {
    if (confirm("Yakin ingin menghapus voucher ini?")) {
      try {
        await deleteVoucher(code);
        showToast("Voucher berhasil dihapus", "success");
      } catch {
        showToast("Gagal menghapus voucher", "error");
      }
    }
  };

  const handleRefreshExpiry = async () => {
    try {
      await checkAndExpireSubscribers();
      showToast("Status subscriber berhasil diperbarui", "success");
    } catch {
      showToast("Gagal memperbarui status", "error");
    }
  };

  const handleSaveSettings = async (data: WebsiteSettings) => {
    setSaving(true);
    try {
      await updateSettings(data);
      showToast("Pengaturan website berhasil disimpan!", "success");
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan pengaturan.", "error");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Mobile Header & Tabs */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <h1 className="text-sm font-bold">Admin Panel</h1>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"
          >
            <LogOut size={16} />
          </button>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 scrollbar-hide gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-slate-400 text-xs truncate pl-11">{user.email}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={18} className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"} /> 
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors mb-1"
          >
            <Home size={18} className="text-slate-400" /> Kunjungi Website
          </a>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} className="text-red-500" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1200px] mx-auto">
        {/* ====================== OVERVIEW TAB ====================== */}
        {activeTab === "overview" && (
          <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-medium">Total Subscribers</p>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users size={16} className="text-slate-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>

              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-medium">Active</p>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                       <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                       <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
              </div>

              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-medium">Hampir Habis</p>
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <Clock size={16} className="text-amber-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.expiringSoon}</p>
              </div>

              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-medium">Expired</p>
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{stats.expired}</p>
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-5">
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-slate-800">Voucher Aktif</h3>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Tag size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">{vouchers.filter((v) => v.isActive).length}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{vouchers.reduce((acc, v) => acc + (v.currentUses || 0), 0)}</span> total penggunaan voucher
                </div>
              </div>

              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-base font-semibold text-slate-800 mb-6">Quick Actions</h3>
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={() => {
                      setSubEditData(null);
                      setSubModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Plus size={16} /> Tambah Subscriber Baru
                  </button>
                  <button
                    onClick={() => {
                      setVouchEditData(null);
                      setVouchModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Tag size={16} className="text-slate-400" /> Buat Voucher Baru
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Subscribers */}
            {recentSubs.length > 0 && (
              <div className="mt-5 bg-white shadow-sm border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-slate-800">
                    Subscriber Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab("subscribers")}
                    className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Lihat Semua <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentSubs.map((sub) => {
                    const badge = getStatusBadge(sub.status, sub.endDate);
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 mb-0.5">
                            {sub.nama}
                          </p>
                          <p className="text-xs text-slate-500">
                            {sub.email} •{" "}
                            {sub.paket === "super_power"
                              ? "Super Power"
                              : "Invitation"}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${badge.bgColor} ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================== SUBSCRIBERS TAB ====================== */}
        {activeTab === "subscribers" && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-grow">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, email, atau WA..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none pr-8"
                  >
                    <option value="all" className="bg-white">
                      Semua Status
                    </option>
                    <option value="active" className="bg-white">
                      Active
                    </option>
                    <option value="expired" className="bg-white">
                      Expired
                    </option>
                    <option value="cancelled" className="bg-white">
                      Cancelled
                    </option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                </div>
                <button
                  onClick={handleRefreshExpiry}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
                  title="Refresh expired status"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => {
                    setSubEditData(null);
                    setSubModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Plus size={16} /> Tambah
                </button>
              </div>
            </div>

            {/* Result Count */}
            {(searchQuery || statusFilter !== "all") && (
              <p className="text-slate-500 text-xs mb-3">
                {filteredSubs.length} hasil ditemukan
                {searchQuery && ` untuk "${searchQuery}"`}
              </p>
            )}

            {/* Table */}
            {subsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="animate-spin text-blue-400" />
                <p className="text-slate-500 text-sm">Memuat data...</p>
              </div>
            ) : filteredSubs.length === 0 ? (
              <div className="text-center py-16">
                <Users size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">
                  {searchQuery || statusFilter !== "all"
                    ? "Tidak ada subscriber yang cocok dengan filter"
                    : "Belum ada subscriber"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <button
                    onClick={() => {
                      setSubEditData(null);
                      setSubModalOpen(true);
                    }}
                    className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
                  >
                    Tambah subscriber pertama
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02] text-slate-500 text-[11px] uppercase tracking-wider font-medium border-b border-slate-100">
                      <th className="text-left px-5 py-4">
                        Subscriber
                      </th>
                      <th className="text-left px-5 py-4 hidden sm:table-cell">
                        Paket
                      </th>
                      <th className="text-left px-5 py-4 hidden md:table-cell">
                        Mulai
                      </th>
                      <th className="text-left px-5 py-4">
                        Berakhir
                      </th>
                      <th className="text-left px-5 py-4">
                        Status
                      </th>
                      <th className="text-right px-5 py-4">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSubs.map((sub) => {
                      const badge = getStatusBadge(sub.status, sub.endDate);
                      const daysLeft = getDaysRemaining(sub.endDate);
                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-white/[0.04] transition-colors group"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-800">
                              {sub.nama}
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5">
                              {sub.email}
                            </div>
                            <div className="text-slate-400 text-xs sm:hidden mt-1">
                              {sub.paket === "super_power"
                                ? "Super Power"
                                : "Invitation"}{" "}
                              <span className="mx-1 text-slate-300">|</span> {sub.durasi} bln
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${sub.paket === "super_power" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}
                            >
                              {sub.paket === "super_power"
                                ? "Super Power"
                                : "Invitation"}
                            </span>
                            <span className="text-slate-500 text-xs block mt-2 font-medium">
                              {sub.durasi} bulan
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs hidden md:table-cell font-mono">
                            {sub.startDate}
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-slate-600 text-xs font-mono">
                              {sub.endDate}
                            </div>
                            {sub.status === "active" && (
                              <RealtimeCountdown endDate={sub.endDate} daysLeft={daysLeft} />
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bgColor} ${badge.color} ${
                                badge.label === "Active" ? "border-emerald-200" : 
                                badge.label === "Expiring" ? "border-amber-200" : 
                                badge.label === "Dibatalkan" || badge.label === "Cancelled" ? "border-slate-200" : "border-red-200"
                              }`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSubEditData(sub);
                                  setSubModalOpen(true);
                                }}
                                className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500 hover:text-blue-400"
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSubscriber(sub.id)
                                }
                                className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-red-500/10 transition-colors text-slate-500 hover:text-red-400"
                                title="Hapus"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====================== VOUCHERS TAB ====================== */}
        {activeTab === "vouchers" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-600">
                {vouchers.length} voucher
              </h3>
              <button
                onClick={() => {
                  setVouchEditData(null);
                  setVouchModalOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={16} /> Buat Voucher
              </button>
            </div>

            {vouchLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="animate-spin text-blue-400" />
                <p className="text-slate-500 text-sm">Memuat voucher...</p>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-16">
                <Tag size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">
                  Belum ada voucher
                </p>
                <button
                  onClick={() => {
                    setVouchEditData(null);
                    setVouchModalOpen(true);
                  }}
                  className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
                >
                  Buat voucher pertama
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {vouchers.map((v) => (
                  <div
                    key={v.code}
                    className={`bg-slate-50 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${v.isActive ? "border-slate-200" : "border-slate-100 opacity-50"}`}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-slate-800 font-bold text-sm bg-slate-50 px-2 py-0.5 rounded-md">
                          {v.code}
                        </code>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${v.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                        >
                          {v.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {v.type === "percentage"
                          ? `Diskon ${v.value}%`
                          : `Potongan Rp${v.value.toLocaleString("id-ID")}`}
                        <span className="mx-1.5 text-slate-300">|</span>
                        Dipakai {v.currentUses || 0} dari {v.maxUses}
                        {v.expiredAt && (
                           <>
                             <span className="mx-1.5 text-slate-300">|</span>
                             Expired: {v.expiredAt}
                           </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setVouchEditData(v);
                          setVouchModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500 hover:text-blue-400"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(v.code)}
                        className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-red-500/10 transition-colors text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================== SETTINGS TAB ====================== */}
        {activeTab === "settings" && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-600">
                Pengaturan Website
              </h3>
              <p className="text-xs text-slate-500 mt-1">Ubah konten dinamis pada halaman utama (landing page).</p>
            </div>
            
            {settingsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="animate-spin text-blue-400" />
                <p className="text-slate-500 text-sm">Memuat pengaturan...</p>
              </div>
            ) : (
              <SettingsTabContent
                initialSettings={settings}
                onSave={handleSaveSettings}
                saving={saving}
              />
            )}
          </div>
        )}
        </div>
      </main>

      {/* Modals */}
      <SubscriberFormModal
        isOpen={subModalOpen}
        onClose={() => {
          setSubModalOpen(false);
          setSubEditData(null);
        }}
        onSave={handleSaveSubscriber}
        editData={subEditData}
        saving={saving}
      />
      <VoucherFormModal
        isOpen={vouchModalOpen}
        onClose={() => {
          setVouchModalOpen(false);
          setVouchEditData(null);
        }}
        onSave={handleSaveVoucher}
        editData={vouchEditData}
        saving={saving}
      />
    </div>
  );
}

// ============================================
// ROOT COMPONENT: Auth Gate
// ============================================

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-400" />
        <p className="text-slate-500 text-sm">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Dashboard hanya dirender setelah user login
  // Ini penting agar useSubscribers() dan useVouchers() hanya berjalan setelah auth
  return <DashboardContent user={user} />;
}
