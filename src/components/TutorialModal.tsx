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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`relative bg-white w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          isUnlocked ? "max-w-4xl rounded-xl" : "max-w-md rounded-2xl"
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
          /* Locked State */
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Video Terkunci</h3>
              <p className="text-sm text-slate-500">
                Masukkan kunci akses untuk menonton <strong>{title}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setError(false);
                  }}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-center text-lg tracking-widest font-semibold focus:outline-none transition-colors ${
                    error ? "border-red-500 text-red-600" : "border-slate-200 focus:border-blue-500 text-slate-800"
                  }`}
                  placeholder="KODE KUNCI"
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-xs mt-2 flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> Kunci tidak valid, silakan coba lagi.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Play size={18} /> Buka Video
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
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  className="w-full h-full max-h-[80vh] object-contain"
                >
                  Browser Anda tidak mendukung pemutar video HTML5.
                </video>
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
