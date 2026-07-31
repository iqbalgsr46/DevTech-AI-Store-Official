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

const TypewriterLine = ({ text, startDelay }: { text: string; startDelay: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
      let i = 0;
      const type = () => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
          timeout = setTimeout(type, 15 + Math.random() * 25);
        } else {
          setIsTyping(false);
        }
      };
      type();
    }, startDelay);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout);
    };
  }, [text, startDelay]);

  if (!hasStarted) return null;

  return (
    <div className="opacity-90">
      {displayedText}
      {isTyping && <span className="inline-block w-1.5 h-3 bg-[#27c93f] ml-1 align-middle animate-pulse" />}
    </div>
  );
};

export default function RedeemModal({ isOpen, onClose, initialPasscode }: RedeemModalProps) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [redeemData, setRedeemData] = useState<RedeemLink | null>(null);
  const [hasReadGuide, setHasReadGuide] = useState(false);
  const [isTerminalMode, setIsTerminalMode] = useState(false);

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
      setHasReadGuide(false);
      setIsTerminalMode(false);
    }
  }, [isOpen, initialPasscode]);

  const terminalSequence = [
    { text: "user@jio-server:~$ ./unlock_order.sh", delay: 0 },
    { text: "[+] Initializing secure connection to server...", delay: 1000 },
    { text: "[+] Verifying credentials... OK", delay: 2200 },
    { text: "[+] Decrypting payload... [██████████] 100%", delay: 3500 },
    { text: "[+] Bypassing security layers... SUCCESS", delay: 4800 },
    { text: "[+] Order successfully unlocked.", delay: 6000 },
    { text: "user@jio-server:~$ Redirecting to secure link...", delay: 7000 }
  ];

  // Terminal redirect effect
  useEffect(() => {
    if (isTerminalMode && redeemData) {

      const timer = setTimeout(() => {
        const targetUrl = redeemData.url;
        if (!redeemData.isOpened) {
          updateRedeemLink(redeemData.id, { isOpened: true })
            .catch(console.error)
            .finally(() => {
              window.location.href = targetUrl;
            });
        } else {
          window.location.href = targetUrl;
        }
      }, 7500);

      return () => clearTimeout(timer);
    }
  }, [isTerminalMode, redeemData]);

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
            className={`relative overflow-hidden border transform-gpu ${
              isTerminalMode
                ? "w-[90%] max-w-[340px] sm:w-full sm:max-w-xl bg-[#0a0a0a] rounded-[24px] border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                : `w-[85%] max-w-[280px] sm:w-full bg-white border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] ${
                    redeemData ? "sm:max-w-2xl rounded-2xl" : "sm:max-w-md rounded-[24px]"
                  }`
            }`}
          >
            {/* Close Button */}
            {!isTerminalMode && (
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 z-50 rounded-full p-2 transition-colors backdrop-blur-md bg-black/5 hover:bg-black/10 text-slate-600`}
              >
                <X size={20} />
              </button>
            )}

            {isTerminalMode ? (
              <div className="w-full h-full text-[#27c93f] p-5 sm:p-8 font-mono text-[11px] sm:text-[13px] min-h-[350px] flex flex-col relative leading-relaxed">
                <div className="absolute top-0 left-0 right-0 h-10 bg-[#1a1a1a] flex items-center px-5 gap-2 border-b border-white/5 shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  <div className="ml-3 text-[11px] text-slate-400 font-sans tracking-wide">TERMINAL - ROOT</div>
                </div>
                <div className="mt-8 flex flex-col gap-2.5 break-words">
                  {terminalSequence.map((item, i) => (
                    <TypewriterLine key={i} text={item.text} startDelay={item.delay} />
                  ))}
                  {!terminalSequence.find(item => item.delay > 7000) && (
                    <div className="w-2 sm:w-2.5 h-4 sm:h-5 bg-[#27c93f] animate-pulse mt-1"></div>
                  )}
                </div>
              </div>
            ) : !redeemData ? (
              /* Locked State */
              <div className="p-4 sm:p-10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="text-center mb-4 sm:mb-8 relative z-10">
                  <div style={{ perspective: "1000px" }} className="w-16 h-16 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-6 relative">
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
                          className="absolute text-amber-600 w-7 h-7 sm:w-12 sm:h-12" 
                          strokeWidth={2} 
                          style={{ transform: `translateZ(${i}px)` }} 
                        />
                      ))}
                      {/* Front golden face with glow */}
                      <KeyRound 
                        className="absolute text-yellow-400 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)] w-7 h-7 sm:w-12 sm:h-12" 
                        strokeWidth={2} 
                        style={{ transform: `translateZ(5px)` }} 
                      />
                    </motion.div>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-0.5 sm:mb-2 tracking-tight">Klaim Pesanan</h3>
                  <p className="text-[13px] sm:text-[15px] text-slate-500 leading-relaxed">
                    Masukkan KODE AKSES rahasia dari Admin<br className="hidden sm:block"/>
                    untuk membuka pesanan Anda.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5 relative z-10">
                  <div>
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value.toUpperCase());
                        setError(false);
                      }}
                      className={`w-full bg-white border rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-center text-lg sm:text-xl tracking-[0.2em] font-bold focus:outline-none transition-all shadow-sm ${
                        error ? "border-red-400 text-red-500 focus:ring-4 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10"
                      }`}
                      placeholder="KODE KUNCI"
                      autoFocus
                    />
                    {error && (
                      <p className="text-red-500 text-[12px] sm:text-sm mt-2 sm:mt-3 flex items-center justify-center gap-1.5 font-medium animate-in slide-in-from-top-1">
                        <AlertCircle size={16} /> Kode tidak valid, coba lagi.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !passcode.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 border border-blue-400/20 text-white text-[13px] sm:text-base font-semibold py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} className="fill-white/20" />} 
                    Buka Akses Pesanan
                  </button>
                </form>
              </div>
            ) : (
              /* Unlocked State (Success) */
              <div className="w-full bg-white text-slate-800 flex flex-col p-3 sm:p-10 relative overflow-hidden">
                {/* Clean decorative background elements */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10 text-center mb-4 sm:mb-8">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-5 border border-emerald-100 shadow-sm">
                    <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-slate-900 leading-tight">Akses Berhasil Dibuka!</h3>
                  <p className="text-[13px] sm:text-base text-slate-500 font-medium leading-snug">Pesanan Anda sudah siap digunakan.</p>
                </div>

                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 sm:p-6 mb-4 sm:mb-8 relative z-10 shadow-sm">
                  <h4 className="font-bold text-amber-700 mb-2 sm:mb-3 flex items-center gap-1.5 text-[13px] sm:text-[15px]">
                    <AlertCircle className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] text-amber-600 animate-pulse" /> Wajib Baca: Panduan Aktivasi
                  </h4>
                  <div className="text-amber-900/90 text-[12px] sm:text-sm leading-relaxed whitespace-pre-wrap font-medium mb-3 sm:mb-4">
                    {redeemData.guideText}
                  </div>
                  
                  <div className="pt-3 border-t border-amber-200/60 mt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input
                          type="checkbox"
                          className="peer w-5 h-5 appearance-none rounded-md border-2 border-amber-400 checked:bg-amber-500 checked:border-amber-500 transition-all cursor-pointer"
                          checked={hasReadGuide}
                          onChange={(e) => setHasReadGuide(e.target.checked)}
                        />
                        <CheckCircle2 size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-[12px] sm:text-sm font-bold text-amber-800 select-none group-hover:text-amber-900 transition-colors leading-snug">
                        Saya sudah membaca dan memahami panduan aktivasi di atas.
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!hasReadGuide) return;
                    setIsTerminalMode(true);
                  }}
                  className={`w-full font-bold py-3 sm:py-4 text-[13px] sm:text-base rounded-xl transition-all flex items-center justify-center gap-1.5 relative z-10 ${
                    hasReadGuide
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Link2 size={20} />
                  Buka Link Pesanan Sekarang
                </button>
              </div>
            )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
