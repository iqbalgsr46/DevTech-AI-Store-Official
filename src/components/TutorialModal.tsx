import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Play, AlertCircle } from "lucide-react";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  passcode: string;
}

export default function TutorialModal({
  isOpen,
  onClose,
  title,
  videoUrl,
  passcode,
}: TutorialModalProps) {
  const [inputCode, setInputCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputCode("");
      setIsUnlocked(false);
      setError(false);
    }
  }, [isOpen]);

// Remove early return to allow AnimatePresence exit animations

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim() === passcode) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInputCode("");
    }
  };

  const renderVideoPlayer = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Deteksi YouTube
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        let videoId = "";
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v") || "";
        }
        if (videoId) {
          return (
            <iframe
              className="w-full h-full max-h-[80vh]"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          );
        }
      }

      // Deteksi Google Drive
      if (urlObj.hostname.includes("drive.google.com")) {
        const embedUrl = url.replace(/\/view.*$/, "/preview");
        return (
          <iframe
            className="w-full h-full max-h-[80vh]"
            src={embedUrl}
            title="Google Drive video player"
            frameBorder="0"
            allow="autoplay"
            allowFullScreen
          ></iframe>
        );
      }

      // Default (MP4 URL / File langsung)
      return (
        <video
          src={url}
          controls
          autoPlay
          controlsList="nodownload"
          className="w-full h-full max-h-[80vh] object-contain"
        >
          Browser Anda tidak mendukung pemutar video HTML5.
        </video>
      );
    } catch (e) {
      return (
        <div className="text-slate-500 flex flex-col items-center gap-2">
          <AlertCircle size={32} />
          <p>Format URL Video tidak valid.</p>
        </div>
      );
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
              isUnlocked 
                ? "bg-black max-w-4xl rounded-xl border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                : "bg-white max-w-md rounded-[24px] border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            }`}
          >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 rounded-full p-2 transition-colors backdrop-blur-md ${
            isUnlocked ? "bg-black/20 hover:bg-black/40 text-white" : "bg-black/5 hover:bg-black/10 text-slate-600"
          }`}
        >
          <X size={20} />
        </button>

        {!isUnlocked ? (
          /* Locked State (Premium Clean White Theme) */
          <div className="p-6 sm:p-10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <span className="text-6xl drop-shadow-[0_10px_15px_rgba(59,130,246,0.2)] leading-none -translate-y-1">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Video Terkunci</h3>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                Masukkan kunci akses rahasia untuk menonton <br/>
                <strong className="text-slate-700 font-semibold">{title}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setError(false);
                  }}
                  className={`w-full bg-white border rounded-xl px-5 py-4 text-center text-xl tracking-[0.2em] font-bold focus:outline-none transition-all shadow-sm ${
                    error ? "border-red-400 text-red-500 focus:ring-4 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-blue-500/10"
                  }`}
                  placeholder="KODE KUNCI"
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm mt-3 flex items-center justify-center gap-1.5 font-medium">
                    <AlertCircle size={16} /> Kunci tidak valid, coba lagi.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/20 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play size={18} className="fill-white" /> Buka Video Sekarang
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked State (Video Player) */
          <div className="w-full h-full bg-black flex flex-col">
            <div className="p-4 bg-slate-900 border-b border-slate-800 pr-14">
              <h3 className="text-white font-medium truncate">{title}</h3>
            </div>
            
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {videoUrl ? (
                renderVideoPlayer(videoUrl)
              ) : (
                <div className="text-slate-500 flex flex-col items-center gap-2">
                  <AlertCircle size={32} />
                  <p>Video belum tersedia (Link kosong).</p>
                </div>
              )}
            </div>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
