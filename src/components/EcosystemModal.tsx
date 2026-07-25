"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface EcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTEGRATIONS = [
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png",
    title: "Gmail",
    desc: "Tulis, balas, dan rangkum email panjang dalam hitungan detik. Biarkan AI menyusun draf profesional untuk Anda.",
    bg: "bg-red-500/10"
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/docs_2020q4_48dp.png",
    title: "Google Docs",
    desc: "Dapatkan bantuan menulis dari awal, perbaiki tata bahasa, dan buat ringkasan dokumen dengan satu klik.",
    bg: "bg-blue-500/10"
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/sheets_2020q4_48dp.png",
    title: "Google Sheets",
    desc: "Otomatisasi pembuatan tabel, analisis data kompleks, dan dapatkan formula instan tanpa perlu mengingat rumus.",
    bg: "bg-emerald-500/10"
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/meet_2020q4_48dp.png",
    title: "Google Meet",
    desc: "Gemini dapat membantu merangkum rapat, membuat notulen otomatis, dan menerjemahkan obrolan secara real-time.",
    bg: "bg-green-600/10"
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png",
    title: "Google Drive",
    desc: "Cari informasi tersembunyi di dalam jutaan dokumen Anda dengan bertanya langsung kepada Gemini.",
    bg: "bg-amber-500/10"
  }
];

export default function EcosystemModal({ isOpen, onClose }: EcosystemModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 30, rotateX: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      rotateX: 0,
      transition: { type: "spring", damping: 22, stiffness: 350, staggerChildren: 0.1, delayChildren: 0.1 } 
    },
    exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 20, stiffness: 300 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6 perspective-1000">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[550px] bg-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100vh - 40px)", transformOrigin: "center center" }}
          >
            {/* Header Area */}
            <div className="relative px-6 sm:px-10 pt-10 pb-6 bg-gradient-to-b from-[#f8fafc] to-white shrink-0 border-b border-gray-100">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 hover:scale-105 transition-all shadow-sm z-10"
              >
                <X size={18} />
              </button>
              
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 flex items-center justify-center mb-5"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                  <path d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z" fill="url(#gemini-grad-real)"/>
                  <defs>
                    <linearGradient id="gemini-grad-real" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4285F4"/>
                      <stop offset="33%" stopColor="#9B72CB"/>
                      <stop offset="67%" stopColor="#D96570"/>
                      <stop offset="100%" stopColor="#F4B400"/>
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#0f172a] leading-tight mb-2 tracking-tight">
                Integrasi Ekosistem Google
              </h2>
              <p className="text-[#64748b] text-[15px] leading-relaxed max-w-[400px]">
                Kekuatan AI otomatis terintegrasi ke dalam aplikasi Google Workspace Anda.
              </p>
            </div>

            {/* Content Area - Scrollable */}
            <div className="px-4 sm:px-6 py-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              <div className="flex flex-col gap-2 pb-6">
                {INTEGRATIONS.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    variants={itemVariants}
                    className="group flex items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl hover:bg-[#f8fafc] transition-colors border border-transparent hover:border-gray-200 cursor-default"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.bg} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                      <img src={item.iconUrl} alt={item.title} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-[#0f172a] font-semibold text-[17px] mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      <p className="text-[#64748b] text-[13px] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Fade Out Effect for Scroll */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-[32px]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
