import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Link2, AlertCircle, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { RedeemLink, updateRedeemLink } from "@/lib/database";

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
        <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="flex min-h-[100dvh] items-center justify-center p-4">
            {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.9 }}
            style={{ willChange: "transform, opacity" }}
            className={`relative w-full overflow-hidden border transform-gpu ${
              redeemData 
                ? "bg-white max-w-2xl rounded-2xl border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" 
                : "bg-white max-w-md rounded-[24px] border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 z-10 rounded-full p-2 transition-colors backdrop-blur-md bg-black/5 hover:bg-black/10 text-slate-600`}
            >
              <X size={20} />
            </button>

            {!redeemData ? (
              /* Locked State */
              <div className="p-6 sm:p-10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="text-center mb-6 sm:mb-8 relative z-10">
                  <div style={{ perspective: "1000px" }} className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-6 relative">
                    {/* The circle background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-100/50 rounded-full shadow-sm border border-amber-200/50">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent opacity-60 blur-md pointer-events-none rounded-full"></div>
                    </div>
                    
                    {/* The 3D rotating key */}
                    <motion.div
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 flex items-center justify-center transform-gpu"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Back layers for 3D extrusion depth */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <KeyRound 
                          key={i} 
                          className="absolute text-amber-600 w-9 h-9 sm:w-12 sm:h-12" 
                          strokeWidth={2} 
                          style={{ transform: `translateZ(${i}px)` }} 
                        />
                      ))}
                      {/* Front golden face with glow */}
                      <KeyRound 
                        className="absolute text-yellow-400 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)] w-9 h-9 sm:w-12 sm:h-12" 
                        strokeWidth={2} 
                        style={{ transform: `translateZ(5px)` }} 
                      />
                    </motion.div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2 tracking-tight">Klaim Pesanan</h3>
                  <p className="text-[14px] sm:text-[15px] text-slate-500 leading-relaxed">
                    Masukkan KODE AKSES rahasia dari Admin<br className="hidden sm:block"/>
                    untuk membuka pesanan Anda.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
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
              <div className="w-full bg-white text-slate-800 flex flex-col p-6 sm:p-10 relative overflow-hidden">
                {/* Clean decorative background elements */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10 text-center mb-8">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-sm">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">Akses Berhasil Dibuka!</h3>
                  <p className="text-slate-500 font-medium">Pesanan Anda sudah siap digunakan.</p>
                </div>

                <div className="bg-blue-50/80 border border-blue-100/80 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 relative z-10 shadow-sm">
                  <h4 className="font-bold text-blue-700 mb-2 sm:mb-3 flex items-center gap-2 text-[15px]">
                    <AlertCircle size={18} className="text-blue-600" /> Panduan Aktivasi
                  </h4>
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {redeemData.guideText}
                  </div>
                </div>

                <a
                  href={redeemData.url}
                  onClick={(e) => {
                    if (!redeemData.isOpened) {
                      e.preventDefault();
                      const targetUrl = redeemData.url;
                      // Buka tab kosong dulu secara sinkron agar tidak diblokir popup blocker
                      const newWindow = window.open('', '_blank');
                      
                      updateRedeemLink(redeemData.id, { isOpened: true })
                        .catch(console.error)
                        .finally(() => {
                          if (newWindow) {
                            newWindow.location.href = targetUrl;
                          } else {
                            window.location.href = targetUrl;
                          }
                        });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 relative z-10"
                >
                  <Link2 size={20} />
                  Buka Link Pesanan Sekarang
                </a>
              </div>
            )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
