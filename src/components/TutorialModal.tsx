import React, { useState, useEffect } from "react";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`relative w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 border ${
          isUnlocked ? "bg-black max-w-4xl rounded-xl border-slate-800" : "bg-slate-900 max-w-md rounded-[24px] border-slate-700/50"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {!isUnlocked ? (
          /* Locked State (Premium Dark Theme) */
          <div className="p-8 sm:p-10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700/50">
                <span className="text-6xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] leading-none -translate-y-1">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Video Terkunci</h3>
              <p className="text-[15px] text-slate-400 leading-relaxed">
                Masukkan kunci akses rahasia untuk menonton <br/>
                <strong className="text-slate-200 font-semibold">{title}</strong>
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
                  className={`w-full bg-slate-950/50 border rounded-xl px-5 py-4 text-center text-xl tracking-[0.2em] font-bold focus:outline-none transition-all shadow-inner backdrop-blur-sm ${
                    error ? "border-red-500/50 text-red-400 focus:ring-1 focus:ring-red-500/50" : "border-slate-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600"
                  }`}
                  placeholder="KODE KUNCI"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm mt-3 flex items-center justify-center gap-1.5 font-medium">
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
      </div>
    </div>
  );
}
