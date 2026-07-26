import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Link2, AlertCircle, Loader2 } from "lucide-react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { RedeemLink } from "@/lib/database";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPasscode?: string;
}

export default function RedeemModal({ isOpen, onClose, initialPasscode }: RedeemModalProps) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [redeemData, setRedeemData] = useState<RedeemLink | null>(null);

  // Reset state
  useEffect(() => {
    if (isOpen) {
      if (initialPasscode) {
        setPasscode(initialPasscode.toUpperCase());
      }
    } else {
      setPasscode("");
      setRedeemData(null);
      setError(false);
    }
  }, [isOpen, initialPasscode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setError(false);

    try {
      const linksRef = ref(db, "settings/redeemLinks");
      const snapshot = await get(linksRef);
      const data = snapshot.val();
      
      if (data) {
        const linksArray = Object.values(data) as RedeemLink[];
        const found = linksArray.find((l) => l.passcode.toUpperCase() === passcode.trim().toUpperCase());
        
        if (found) {
          setRedeemData(found);
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.9 }}
            style={{ willChange: "transform, opacity" }}
            className={`relative w-full overflow-hidden border transform-gpu ${
              redeemData 
                ? "bg-slate-900 max-w-2xl rounded-2xl border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                : "bg-white max-w-md rounded-[24px] border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 z-10 rounded-full p-2 transition-colors backdrop-blur-md ${
                redeemData ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-slate-600"
              }`}
            >
              <X size={20} />
            </button>

            {!redeemData ? (
              /* Locked State */
              <div className="p-8 sm:p-10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="text-center mb-8 relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                    <span className="text-5xl drop-shadow-[0_10px_15px_rgba(59,130,246,0.2)] leading-none -translate-y-1">🎁</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Klaim Pesanan</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    Masukkan KODE AKSES rahasia dari Admin<br/>
                    untuk membuka pesanan Anda.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  <div>
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value.toUpperCase());
                        setError(false);
                      }}
                      className={`w-full bg-white border rounded-xl px-5 py-4 text-center text-xl tracking-[0.2em] font-bold focus:outline-none transition-all shadow-sm ${
                        error ? "border-red-400 text-red-500 focus:ring-4 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10"
                      }`}
                      placeholder="KODE KUNCI"
                      autoFocus
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-3 flex items-center justify-center gap-1.5 font-medium animate-in slide-in-from-top-1">
                        <AlertCircle size={16} /> Kode tidak valid, coba lagi.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !passcode.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 border border-blue-400/20 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} className="fill-white/20" />} 
                    Buka Akses Pesanan
                  </button>
                </form>
              </div>
            ) : (
              /* Unlocked State (Success) */
              <div className="w-full bg-slate-900 text-white flex flex-col p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10 text-center mb-8">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Akses Berhasil Dibuka!</h3>
                  <p className="text-slate-400">Pesanan Anda sudah siap digunakan.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 relative z-10">
                  <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} /> Panduan Aktivasi
                  </h4>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {redeemData.guideText}
                  </div>
                </div>

                <a
                  href={redeemData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 relative z-10"
                >
                  <Link2 size={20} />
                  Buka Link Pesanan Sekarang
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
