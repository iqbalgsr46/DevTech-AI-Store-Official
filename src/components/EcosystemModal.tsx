"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, FileText, Table, Video, HardDrive, Sparkles } from "lucide-react";

interface EcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTEGRATIONS = [
  {
    icon: Mail,
    title: "Gmail",
    desc: "Tulis, balas, dan rangkum email panjang dalam hitungan detik. Biarkan AI menyusun draf profesional untuk Anda.",
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
  {
    icon: FileText,
    title: "Google Docs",
    desc: "Dapatkan bantuan menulis dari awal, perbaiki tata bahasa, dan buat ringkasan dokumen dengan satu klik.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Table,
    title: "Google Sheets",
    desc: "Otomatisasi pembuatan tabel, analisis data kompleks, dan dapatkan formula instan tanpa perlu mengingat rumus.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    icon: Video,
    title: "Google Meet",
    desc: "Gemini dapat membantu merangkum rapat, membuat notulen otomatis, dan menerjemahkan obrolan secara real-time.",
    color: "text-green-600",
    bg: "bg-green-600/10"
  },
  {
    icon: HardDrive,
    title: "Google Drive",
    desc: "Cari informasi tersembunyi di dalam jutaan dokumen Anda dengan bertanya langsung kepada Gemini.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
];

export default function EcosystemModal({ isOpen, onClose }: EcosystemModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          {/* Backdrop with elegant blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[600px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header Area */}
            <div className="relative px-8 pt-10 pb-6 bg-gradient-to-b from-blue-50/50 to-white shrink-0">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:scale-105 transition-all shadow-sm z-10"
              >
                <X size={20} />
              </button>
              
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#0f172a] leading-tight mb-3">
                Kekuatan AI di Seluruh<br />Ekosistem Google Anda
              </h2>
              <p className="text-[#64748b] text-[15px] leading-relaxed max-w-[450px]">
                Akun Google AI Pro Anda otomatis terintegrasi ke dalam aplikasi Google Workspace yang Anda gunakan setiap hari.
              </p>
            </div>

            {/* Content Area */}
            <div className="px-8 pb-10 overflow-y-auto scrollbar-hide flex-1 relative">
              <div className="grid grid-cols-1 gap-4">
                {INTEGRATIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (idx * 0.05) }}
                      className="group flex gap-5 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-[#0f172a] font-semibold text-[16px] mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-[#64748b] text-[13px] leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Elegant Fade at bottom of scroll */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-[32px]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
