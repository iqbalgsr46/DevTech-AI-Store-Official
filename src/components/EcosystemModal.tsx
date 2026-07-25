"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface EcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTEGRATIONS = [
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png",
    title: "Gmail",
    desc: "Tulis & balas email profesional dalam hitungan detik dengan bantuan AI.",
    bg: "#fef2f2",
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/docs_2020q4_48dp.png",
    title: "Google Docs",
    desc: "Buat, edit, dan rangkum dokumen panjang dengan AI yang cerdas.",
    bg: "#eff6ff",
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/sheets_2020q4_48dp.png",
    title: "Google Sheets",
    desc: "Analisis data dan buat formula kompleks secara instan.",
    bg: "#f0fdf4",
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/meet_2020q4_48dp.png",
    title: "Google Meet",
    desc: "Rangkum rapat & notulen otomatis secara real-time.",
    bg: "#f0fdf4",
  },
  {
    iconUrl: "https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png",
    title: "Google Drive",
    desc: "Cari informasi dari jutaan file Anda cukup dengan bertanya.",
    bg: "#fffbeb",
  },
];

export default function EcosystemModal({ isOpen, onClose }: EcosystemModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 360 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                pointerEvents: "auto",
                background: "#ffffff",
                borderRadius: "28px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                width: "100%",
                maxWidth: "640px",
                maxHeight: "calc(100vh - 32px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* ─── HEADER ─── */}
              <div
                style={{
                  padding: "32px 32px 24px 32px",
                  borderBottom: "1px solid #f1f5f9",
                  background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  position: "relative",
                }}
              >
                {/* Gemini Icon */}
                <motion.div
                  initial={{ rotate: -12, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 180, delay: 0.15 }}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 2px 6px rgba(66,133,244,0.3))" }}>
                    <path d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z" fill="url(#g1)" />
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="35%" stopColor="#9B72CB" />
                        <stop offset="70%" stopColor="#D96570" />
                        <stop offset="100%" stopColor="#F4B400" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Heading */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3, margin: "0 0 6px 0", paddingRight: "48px" }}>
                    Integrasi Ekosistem Google
                  </h2>
                  <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                    Kekuatan AI terintegrasi langsung ke Google Workspace Anda.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#94a3b8",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                    (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                    (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* ─── CONTENT (Scrollable) ─── */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 24px 28px 24px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(1, 1fr)",
                    gap: "8px",
                  }}
                >
                  {INTEGRATIONS.map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + idx * 0.07, type: "spring", damping: 22, stiffness: 300 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 16px",
                        borderRadius: "16px",
                        border: "1px solid transparent",
                        cursor: "default",
                        transition: "all 0.18s ease",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                        (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
                      }}
                    >
                      {/* Icon Box */}
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          background: item.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "transform 0.25s ease",
                        }}
                      >
                        <img
                          src={item.iconUrl}
                          alt={item.title}
                          style={{ width: "28px", height: "28px", objectFit: "contain" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 3px 0" }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.55 }}>
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
