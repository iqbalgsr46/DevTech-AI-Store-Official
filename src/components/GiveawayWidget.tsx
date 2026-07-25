import React, { useState } from "react";
import { Gift, X, ExternalLink, CheckCircle2 } from "lucide-react";
import { WebsiteSettings } from "@/lib/database";

export default function GiveawayWidget({
  settings,
}: {
  settings: WebsiteSettings | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const giveaway = settings?.giveaway || {
    isActive: false,
    tiktokUrl: "",
    googleFormUrl: "",
    announcementDate: "",
  };

  return (
    <>
      <style>{`
        @keyframes float-gift {
          0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 10px 15px rgba(244, 63, 94, 0.4)); }
          50% { transform: translateY(-15px) scale(1.05); filter: drop-shadow(0 25px 20px rgba(244, 63, 94, 0.2)); }
        }
        @keyframes wiggle-gift {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        .animate-gift-float {
          animation: float-gift 3.5s ease-in-out infinite;
        }
        .gift-emoji {
          display: inline-block;
          animation: wiggle-gift 4s ease-in-out infinite;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
        }
        .gift-button-glow {
          box-shadow: 0 0 25px rgba(244, 63, 94, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.4);
        }
      `}</style>
      {/* Floating Gift Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-[45] bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 text-white p-3 sm:p-4 rounded-full hover:scale-110 active:scale-95 transition-all animate-gift-float gift-button-glow border-2 border-white/40 backdrop-blur-sm"
        aria-label="Giveaway"
      >
        <span className="text-4xl sm:text-5xl gift-emoji leading-none">🎁</span>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white">
                <span className="text-5xl gift-emoji leading-none">🎁</span>
              </div>

              {!giveaway.isActive ? (
                <>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Belum Ada Giveaway
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Mohon maaf, saat ini sedang tidak ada event Giveaway. Pantau terus update dari kami ya!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                    Giveaway Spesial! 🎉
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Ikuti event giveaway dan dapatkan{" "}
                    <strong className="text-pink-600">Voucher Gratis Akun Google AI Pro 18 Bulan!</strong>
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left mb-6">
                    <h4 className="font-semibold text-slate-700 text-sm mb-3">
                      Syarat & Ketentuan Ikut Serta:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Buka tautan video TikTok kami di bawah.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Wajib <strong>Follow, Like, Comment, & Share</strong> video tersebut.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Isi Form Pendaftaran (Nama Lengkap, No. HP, Email).</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Upload semua bukti <strong>Screenshot</strong> pada saat pengisian form.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3">
                    <a
                      href={giveaway.tiktokUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      Buka Video TikTok <ExternalLink size={16} />
                    </a>
                    <a
                      href={giveaway.googleFormUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      Isi Form Pendaftaran
                    </a>
                  </div>

                  {giveaway.announcementDate && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        Pengumuman pemenang: <strong className="text-slate-700">{giveaway.announcementDate}</strong>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
