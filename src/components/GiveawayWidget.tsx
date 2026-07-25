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
  };

  return (
    <>
      {/* Floating Gift Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-24 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-[45] bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all animate-bounce"
        aria-label="Giveaway"
      >
        <Gift size={28} />
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
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift size={32} className="text-pink-600" />
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
                        <span>Follow akun TikTok kami.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Beri komentar pada link video TikTok.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Share video tersebut ke teman kalian.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Kirim bukti screenshot pada pengisian syarat jadi peserta.</span>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
