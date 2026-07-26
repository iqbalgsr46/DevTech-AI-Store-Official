"use client";

import React from "react";
import { motion } from "framer-motion";
import { GoogleIcon } from "./GoogleIcon";

interface FloatingGoogleBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
  duration?: number;
  floatY?: number;
  iconSize?: number;
  shadowStyle?: string;
}

export const FloatingGoogleBadge: React.FC<FloatingGoogleBadgeProps> = ({
  className = "",
  size = "md",
  delay = 0,
  duration = 4,
  floatY = 12,
  iconSize = 24,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2",
    md: "w-10 h-10 sm:w-14 sm:h-14 p-2 sm:p-3",
    lg: "w-12 h-12 sm:w-16 sm:h-16 p-2.5 sm:p-3.5",
    xl: "w-16 h-16 sm:w-20 sm:h-20 p-3 sm:p-4",
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: [-floatY, floatY, -floatY],
        rotate: [-1.5, 1.5, -1.5],
        scale: [1, 1.03, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: delay,
      }}
      whileHover={{ scale: 1.15, rotate: 5, transition: { duration: 0.2 } }}
      className={`relative flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] backdrop-blur-sm ${sizeClasses[size]} ${className}`}
    >
      <GoogleIcon size={iconSize} />
    </motion.div>
  );
};
