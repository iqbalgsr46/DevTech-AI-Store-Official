"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, X, CheckCircle2, Zap, Sparkles, Users, ChevronLeft, ChevronRight, Play, Instagram, Facebook, Linkedin, Youtube, MessageCircle, Shield, Lock, Twitter } from "lucide-react";
import { Quicksand, Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import OrderModal from "@/components/OrderModal";
import EcosystemModal from "@/components/EcosystemModal";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { useSettings } from "@/lib/database";
import AsciiTree from "@/components/AsciiTree";
import GiveawayWidget from "@/components/GiveawayWidget";
import TutorialModal from "@/components/TutorialModal";
import RedeemModal from "@/components/RedeemModal";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Komponen Reveal saat di-scroll
const ScrollReveal = ({ children, delay = 0, y = 40, className = "" }: { children: React.ReactNode, delay?: number, y?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.05 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`w-full flex flex-col items-center ${className}`}
    style={{ willChange: "transform, opacity" }}
  >
    {children}
  </motion.div>
);

// Komponen Animasi Angka (Count Up) saat di-scroll
const CountUp = ({ to, suffix = "" }: { to: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting); // Selalu deteksi setiap kali masuk/keluar layar
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setCount(0); // Reset ke 0 saat di luar layar agar bisa animasi ulang
      return;
    }
    
    const end = to;
    const duration = 2000; // 2 detik animasi
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease Out Quartic
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOut));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, to]);

  return <span ref={ref}>{count.toLocaleString('id-ID').replace(/,/g, '.')}{suffix}</span>;
}

// Komponen Animasi Rotating 3D ASCII Globe dengan Peta Bumi & Bioma (Canvas Version)
const AsciiGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Peta Bumi Equirectangular Resolusi Tinggi (80x36) dengan pulau-pulau asli
  const earthMap = [
    "                                                                                ",
    "   ########                  ##########                                         ",
    "  ###########             ###################                                   ",
    " ##############           #####################                 #               ",
    " ###############         ########################              ###              ",
    " ################        #########################            #####             ",
    "  ###############  #    ###########################          #######            ",
    "  ##################    ############################         ########           ",
    "   #################    #############################        ########           ",
    "   #################     ############################        ########           ",
    "    ################     ############################        #######            ",
    "     ###############     ############################        ######             ",
    "       #############     ############################        ######             ",
    "         ###########     ############################        #####              ",
    "           #########      ##########################         ####               ",
    "            ########      #########################          ####               ",
    "             #######       ######################            ###                ",
    "              ######       ####################              ##                 ",
    "              ######       ###################               ###                ",
    "              ######        ##################              #####  #            ",
    "              ######        #################                #### ###           ",
    "               #####         ################                  ######           ",
    "               #####         ###############                   ######           ",
    "               ####           #############                   #######           ",
    "               ####           ############                    #######           ",
    "                ###            #########                      ######            ",
    "                ###             ######                         ###  #           ",
    "                ##               ####                               ##          ",
    "                ##                                                              ",
    "                #                                                               ",
    "                                                                                ",
    "                                                                                ",
    "      ######                  ##################                   #####        ",
    "  ##########################################################################    ",
    " ############################################################################   ",
    "##############################################################################  "
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phi = 0;
    const text = "GOOGLEAI";
    let animationId: number;
    let lastTime = 0;

    const width = 80; 
    const height = 40;
    
    const charWidth = 7;
    const charHeight = 14;
    canvas.width = width * charWidth;
    canvas.height = height * charHeight;
    
    ctx.font = "bold 12px monospace";
    ctx.textBaseline = "top";

    const renderGlobe = (time: number) => {
      // 20 FPS for silky performance and 0 lag during scroll
      if (time - lastTime < 50) {
        animationId = requestAnimationFrame(renderGlobe);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const aspect = 0.5;
      
      const lightX = -0.7;
      const lightY = -0.7;
      const lightZ = 0.2;
      
      for (let y = 0; y < height; y++) {
        const ny = (y / (height - 1)) * 2 - 1; 
        
        for (let x = 0; x < width; x++) {
          const nx = ((x / (width - 1)) * 2 - 1) * ((width * aspect) / height); 
          const d = nx*nx + ny*ny;
          
          if (d > 1.05) continue;
          
          let char = '';
          let color = '';
          
          const nz = Math.sqrt(Math.max(0, 1 - d));
          const theta = Math.atan2(nx, nz) + phi;
          const lat = -Math.asin(ny); 
          
          const dotLight = nx * lightX + ny * lightY + nz * lightZ;
          const intensity = Math.max(0.1, dotLight);
          
          let tx = Math.floor(((theta % (2 * Math.PI)) / (2 * Math.PI)) * 80);
          if (tx < 0) tx += 80;
          
          let ty = Math.floor(((-lat + Math.PI/2) / Math.PI) * 36);
          if (ty < 0) ty = 0;
          if (ty > 35) ty = 35;
          
          const organicNoise = Math.sin(theta * 24) * Math.cos(lat * 24) 
                             + Math.sin(theta * 44) * 0.5
                             + Math.cos(lat * 34) * 0.5;
          
          const baseLand = earthMap[ty][tx] === '#';
          const isLand = baseLand ? (organicNoise > -0.7) : (organicNoise > 1.4);
          const deg = (lat * 180) / Math.PI; 
          
          if (isLand) {
            char = text[tx % text.length];
            const colorNoise = Math.sin(theta * 10) * 15 + Math.cos(lat * 10) * 10;
            const organicDeg = deg + colorNoise;
            
            if (organicDeg > 70 || organicDeg < -65) {
              color = '#e2e8f0';
            } else if (organicDeg > -20 && organicDeg < 25) {
              color = '#064e3b';
            } else {
              color = '#4d7c0f';
            }
            
            ctx.globalAlpha = Math.min(1.0, intensity + 0.3);
          } else {
            char = ty % 2 === 0 ? '0' : '1';
            color = '#3b82f6';
            ctx.globalAlpha = Math.min(0.6, intensity);
          }
          
          if (nz < 0.2) {
            char = (x + y) % 2 === 0 ? '-' : '.';
            ctx.globalAlpha = 0.2;
          } else if (nz < 0.3) {
            if (!isLand) char = '.';
            ctx.globalAlpha *= 0.5;
          }
          
          ctx.fillStyle = color;
          ctx.fillText(char, x * charWidth, y * charHeight);
        }
      }
      
      phi -= 0.04;
      animationId = requestAnimationFrame(renderGlobe);
    };
    
    animationId = requestAnimationFrame(renderGlobe);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-auto max-w-[300px] sm:max-w-[380px] mx-auto select-none transform-gpu" 
      style={{ imageRendering: 'pixelated', willChange: 'transform' }} 
    />
  );
};

// Komponen Animasi Rotating 3D ASCII Bintang Gemini
const AsciiGeminiStar = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phi = 0;
    const text = "GEMINI";
    let animationId: number;
    let lastTime = 0;

    const width = 80; 
    const height = 40;
    
    const charWidth = 7;
    const charHeight = 14;
    canvas.width = width * charWidth;
    canvas.height = height * charHeight;
    
    ctx.font = "bold 13px monospace";
    ctx.textBaseline = "top";

    const getMap = (px: number, py: number, pz: number) => {
      const r2d = Math.pow(Math.pow(Math.abs(px), 0.6) + Math.pow(Math.abs(py), 0.6), 1/0.6);
      const d2d = r2d - 1.7;
      const thickness = 0.45 * Math.pow(Math.max(0, 1.0 - r2d / 1.7), 1.5);
      const dZ = Math.abs(pz) - thickness;
      const dExtruded = Math.sqrt(Math.max(d2d, 0)**2 + Math.max(dZ, 0)**2) + Math.min(Math.max(d2d, dZ), 0.0);
      return { d: dExtruded * 0.5, id: 1 }; 
    };

    const renderStar = (time: number) => {
      // 20 FPS for silky performance and 0 lag during scroll
      if (time - lastTime < 50) {
        animationId = requestAnimationFrame(renderStar);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const aspect = (charWidth * width) / (charHeight * height); 
      const camZ = -2.2;
      
      for (let y = 0; y < height; y++) {
        const ny = (y / (height - 1)) * 2 - 1; 
        
        for (let x = 0; x < width; x++) {
          const nx = ((x / (width - 1)) * 2 - 1) * aspect; 
          
          let roX = 0, roY = 0, roZ = camZ;
          let rdX = nx, rdY = ny, rdZ = 1.0;
          
          const rdLen = Math.sqrt(rdX*rdX + rdY*rdY + rdZ*rdZ);
          rdX /= rdLen; rdY /= rdLen; rdZ /= rdLen;
          
          const pan = phi;
          let pX = roX * Math.cos(pan) - roZ * Math.sin(pan);
          let pZ = roX * Math.sin(pan) + roZ * Math.cos(pan);
          roX = pX; roZ = pZ;
          
          let rdpX = rdX * Math.cos(pan) - rdZ * Math.sin(pan);
          let rdpZ = rdX * Math.sin(pan) + rdZ * Math.cos(pan);
          rdX = rdpX; rdZ = rdpZ;
          
          let t = 0;
          let hit = { d: 0, id: 0 };
          let pX_hit=0, pY_hit=0, pZ_hit=0;
          
          // Optimized raymarching steps (28 max steps)
          for (let i = 0; i < 28; i++) {
            pX_hit = roX + rdX * t;
            pY_hit = roY + rdY * t;
            pZ_hit = roZ + rdZ * t;
            
            hit = getMap(pX_hit, pY_hit, pZ_hit);
            
            if (hit.d < 0.01) break;
            t += hit.d;
            if (t > 10.0) { hit.id = 0; break; }
          }
          
          if (hit.id > 0 && hit.d < 0.02) {
            const eps = 0.01;
            const dCenter = getMap(pX_hit, pY_hit, pZ_hit).d;
            const nX = getMap(pX_hit+eps, pY_hit, pZ_hit).d - dCenter;
            const nY = getMap(pX_hit, pY_hit+eps, pZ_hit).d - dCenter;
            const nZ = getMap(pX_hit, pY_hit, pZ_hit+eps).d - dCenter;
            const nLen = Math.sqrt(nX*nX + nY*nY + nZ*nZ);
            const normalX = nX/nLen, normalY = nY/nLen, normalZ = nZ/nLen;
            
            const lX = -0.5, lY = -0.5, lZ = -0.7;
            const dot = normalX*lX + normalY*lY + normalZ*lZ;
            const intensity = Math.max(0.1, dot * 0.9 + 0.1);
            
            const localX = pX_hit * Math.cos(-pan) - pZ_hit * Math.sin(-pan);
            const localY = pY_hit;
            
            const u = Math.max(0, Math.min(1, (localX / 1.7 + 1) / 2));
            const v = Math.max(0, Math.min(1, (localY / 1.7 + 1) / 2));
            
            const tl = {r: 155, g: 114, b: 203};
            const tr = {r: 234, g: 67, b: 53};
            const bl = {r: 66, g: 133, b: 244};
            const br = {r: 251, g: 188, b: 5};
            
            const rTop = tl.r * (1 - u) + tr.r * u;
            const gTop = tl.g * (1 - u) + tr.g * u;
            const bTop = tl.b * (1 - u) + tr.b * u;
            
            const rBot = bl.r * (1 - u) + br.r * u;
            const gBot = bl.g * (1 - u) + br.g * u;
            const bBot = bl.b * (1 - u) + br.b * u;
            
            const rCol = Math.floor(rTop * (1 - v) + rBot * v);
            const gCol = Math.floor(gTop * (1 - v) + gBot * v);
            const bCol = Math.floor(bTop * (1 - v) + bBot * v);
            
            const textIdx = Math.floor(Math.abs(localX * 18 + localY * 18) + time/300);
            const char = text[textIdx % text.length];
            
            if (intensity > 0.85) {
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillStyle = `rgb(${rCol},${gCol},${bCol})`;
                ctx.globalAlpha = Math.min(1.0, intensity + 0.3);
            }
            
            ctx.fillText(char, x * charWidth, y * charHeight);
          }
        }
      }
      
      phi -= 0.03;
      animationId = requestAnimationFrame(renderStar);
    };
    
    animationId = requestAnimationFrame(renderStar);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-auto max-w-[500px] sm:max-w-[700px] mx-auto select-none transform-gpu" 
      style={{ imageRendering: 'pixelated', willChange: 'transform' }} 
    />
  );
};

// Komponen Animasi Rotating 3D ASCII AI Dice (Dadu AI)
const AsciiAIDice = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phi = 0;
    let theta = 0;
    let animationId: number;
    let lastTime = 0;

    const width = 80; 
    const height = 40;
    
    const charWidth = 7;
    const charHeight = 14;
    canvas.width = width * charWidth;
    canvas.height = height * charHeight;
    
    ctx.font = "bold 13px monospace";
    ctx.textBaseline = "top";

    const getMap = (px: number, py: number, pz: number) => {
      let rx = px * Math.cos(-phi) - pz * Math.sin(-phi);
      let rz = px * Math.sin(-phi) + pz * Math.cos(-phi);
      let ry = py * Math.cos(-theta) - rz * Math.sin(-theta);
      let rz2 = py * Math.sin(-theta) + rz * Math.cos(-theta);
      
      const b = 1.3;
      const r = 0.3;
      
      const qx = Math.abs(rx) - b + r;
      const qy = Math.abs(ry) - b + r;
      const qz = Math.abs(rz2) - b + r;
      const len = Math.sqrt(Math.max(qx,0)**2 + Math.max(qy,0)**2 + Math.max(qz,0)**2);
      const max = Math.min(Math.max(qx, Math.max(qy, qz)), 0.0);
      const dCube = len + max - r;
      
      return { d: dCube, id: 1, lx: rx, ly: ry, lz: rz2 };
    };

    const renderDice = (time: number) => {
      // 20 FPS for silky performance and 0 lag during scroll
      if (time - lastTime < 50) {
        animationId = requestAnimationFrame(renderDice);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const aspect = (charWidth * width) / (charHeight * height); 
      const camZ = -3.2;
      
      const shadeChars = " .:-=+*#%@";
      const getShade = (light: number) => {
         const idx = Math.max(0, Math.min(shadeChars.length - 1, Math.floor(light * shadeChars.length)));
         return shadeChars[idx];
      };
      
      for (let y = 0; y < height; y++) {
        const ny = (y / (height - 1)) * 2 - 1; 
        
        for (let x = 0; x < width; x++) {
          const nx = ((x / (width - 1)) * 2 - 1) * aspect; 
          
          let roX = 0, roY = 0, roZ = camZ;
          let rdX = nx, rdY = ny, rdZ = 1.0;
          
          const rdLen = Math.sqrt(rdX*rdX + rdY*rdY + rdZ*rdZ);
          rdX /= rdLen; rdY /= rdLen; rdZ /= rdLen;
          
          let t = 0;
          let hit = { d: 0, id: 0, lx: 0, ly: 0, lz: 0 };
          let pX=0, pY=0, pZ=0;
          
          // Optimized raymarching steps (25 max steps)
          for (let i = 0; i < 25; i++) {
            pX = roX + rdX * t;
            pY = roY + rdY * t;
            pZ = roZ + rdZ * t;
            
            hit = getMap(pX, pY, pZ);
            
            if (hit.d < 0.01) break;
            t += hit.d;
            if (t > 10.0) { hit.id = 0; break; }
          }
          
          if (hit.id > 0 && hit.d < 0.02) {
            const eps = 0.01;
            const dCenter = getMap(pX, pY, pZ).d;
            const nX = getMap(pX+eps, pY, pZ).d - dCenter;
            const nY = getMap(pX, pY+eps, pZ).d - dCenter;
            const nZ = getMap(pX, pY, pZ+eps).d - dCenter;
            const nLen = Math.sqrt(nX*nX + nY*nY + nZ*nZ);
            const normalX = nX/nLen, normalY = nY/nLen, normalZ = nZ/nLen;
            
            const lX = -0.6, lY = -0.8, lZ = -0.4;
            const dot = normalX*lX + normalY*lY + normalZ*lZ;
            const intensity = Math.max(0.1, dot * 0.9 + 0.1);
            
            const absX = Math.abs(hit.lx);
            const absY = Math.abs(hit.ly);
            const absZ = Math.abs(hit.lz);
            
            let u = 0, v = 0;
            if (absX >= absY && absX >= absZ) {
               u = hit.lz * Math.sign(hit.lx); 
               v = hit.ly;
            } else if (absY >= absX && absY >= absZ) {
               u = hit.lx; 
               v = hit.lz * -Math.sign(hit.ly);
            } else {
               u = hit.lx * Math.sign(hit.lz); 
               v = hit.ly;
            }
            
            const sdSegment = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const px = x - x1;
                const py = y - y1;
                const h = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
                return Math.sqrt((px - dx * h)**2 + (py - dy * h)**2);
            };
            
            const thickness = 0.08;
            const dALeft = sdSegment(u, v, -0.3, 0.3, -0.1, -0.3);
            const dARight = sdSegment(u, v, -0.1, -0.3, 0.1, 0.3);
            const dACross = sdSegment(u, v, -0.22, 0.05, 0.02, 0.05);
            const dI = sdSegment(u, v, 0.3, -0.3, 0.3, 0.3);
            
            const inLogo = dALeft < thickness || dARight < thickness || dACross < thickness || dI < thickness;
            
            let char = '';
            
            if (inLogo) {
               char = '@';
               ctx.fillStyle = '#000000';
               ctx.globalAlpha = Math.min(1.0, intensity + 0.8);
            } else {
               char = getShade(intensity);
               ctx.fillStyle = '#ffffff';
               ctx.globalAlpha = Math.min(1.0, intensity + 0.4);
            }
            
            ctx.fillText(char, x * charWidth, y * charHeight);
          }
        }
      }
      
      phi -= 0.025; 
      theta -= 0.015;
      animationId = requestAnimationFrame(renderDice);
    };
    
    animationId = requestAnimationFrame(renderDice);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-auto max-w-[500px] sm:max-w-[700px] mx-auto select-none transform-gpu" 
      style={{ imageRendering: 'pixelated', willChange: 'transform' }} 
    />
  );
};

// Komponen Awan Khusus (Smoke/Fog Style)
const SmokeCloud = ({ className, duration = 60, delay = 0 }: { className?: string, duration?: number, delay?: number }) => (
  <motion.div 
    initial={{ x: "120vw" }}
    animate={{ x: "-120vw" }}
    transition={{ repeat: Infinity, duration, ease: "linear", delay }}
    className={`absolute ${className} opacity-80 pointer-events-none transform-gpu`}
    style={{ willChange: "transform" }}
  >
    <div className="relative w-[350px] sm:w-[600px] h-[200px] sm:h-[350px]">
      <div className="absolute top-[10%] left-[5%] w-[60%] h-[70%] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.7)_0%,_rgba(255,255,255,0)_70%)] blur-[12px] sm:blur-[20px]" />
      <div className="absolute top-[20%] left-[35%] w-[55%] h-[80%] bg-[radial-gradient(ellipse_at_center,_rgba(230,244,253,0.8)_0%,_rgba(230,244,253,0)_70%)] blur-[15px] sm:blur-[25px]" />
      <div className="absolute top-[5%] left-[20%] w-[70%] h-[65%] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.6)_0%,_rgba(255,255,255,0)_75%)] blur-[8px] sm:blur-[15px]" />
    </div>
  </motion.div>
);

// Komponen Hujan Meteor
const MeteorShower = () => {
  const meteors = [
    { top: "-10%", left: "10%", size: 1.5, delay: 0.5, duration: 6 },
    { top: "5%", left: "40%", size: 2.2, delay: 2, duration: 7.5 },
    { top: "20%", left: "-10%", size: 1.2, delay: 3.5, duration: 8 },
    { top: "-5%", left: "60%", size: 1.8, delay: 1, duration: 6.5 },
    { top: "35%", left: "20%", size: 2, delay: 4.5, duration: 9 },
    { top: "15%", left: "80%", size: 1, delay: 5.5, duration: 7 },
    { top: "10%", left: "-20%", size: 1.4, delay: 2.5, duration: 8.5 },
    { top: "25%", left: "65%", size: 1.7, delay: 6, duration: 7 },
    { top: "-15%", left: "30%", size: 1.1, delay: 4, duration: 8 },
  ];

  return (
    <>
      <style>{`
        @keyframes meteor-anim {
          0% { transform: rotate(45deg) translateX(-20vw); opacity: 0; }
          5% { opacity: 1; }
          30% { opacity: 1; }
          40% { transform: rotate(45deg) translateX(150vw); opacity: 0; }
          100% { transform: rotate(45deg) translateX(150vw); opacity: 0; }
        }
        .meteor-tail {
          position: absolute;
          top: 50%;
          right: 50%;
          transform: translateY(-50%);
          height: 1px;
          background: linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0));
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {meteors.map((m, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]"
            style={{
              top: m.top,
              left: m.left,
              width: `${m.size * 2}px`,
              height: `${m.size * 2}px`,
              animation: `meteor-anim ${m.duration}s linear infinite`,
              animationDelay: `${m.delay}s`,
              opacity: 0
            }}
          >
            <div className="meteor-tail" style={{ width: `${m.size * 50}px` }} />
          </div>
        ))}
      </div>
    </>
  );
};

export default function Home() {
  const [typedText, setTypedText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<"super_power" | "invitation">("invitation");
  const [isEcosystemModalOpen, setIsEcosystemModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialData, setTutorialData] = useState({ title: "", videoUrl: "", passcode: "" });
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [initialRedeemCode, setInitialRedeemCode] = useState("");
  
  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const redeemCode = urlParams.get('redeem');
      if (redeemCode) {
        setInitialRedeemCode(redeemCode);
        setIsRedeemModalOpen(true);
      }
    }
  }, []);

  const handleOpenTutorial = (type: "paket1" | "family") => {
    if (!settings?.tutorials) return;
    
    const data = settings.tutorials[type];
    const title = type === "paket1" 
      ? "Panduan Aktivasi Paket 1 (Super Power)" 
      : "Cara Invite Keluarga (Family Sharing)";
      
    setTutorialData({
      title,
      videoUrl: data.videoUrl,
      passcode: data.passcode,
    });
    setIsTutorialOpen(true);
  };
  
  const formatPrice = (priceStr?: string, defaultPrice?: string) => {
    const cleanStr = (priceStr || defaultPrice || "0").replace(/\D/g, "");
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? (defaultPrice || "0") : num.toLocaleString('id-ID');
  };

  const formatShortPrice = (priceStr?: string, defaultPrice?: string) => {
    const cleanStr = (priceStr || defaultPrice || "0").replace(/\D/g, "");
    const num = parseInt(cleanStr, 10);
    if (isNaN(num)) return (defaultPrice || "0").replace(/000$/, 'k');
    
    if (num >= 1000 && num % 1000 === 0) {
      return (num / 1000) + 'k';
    } else if (num >= 1000 && num % 100 === 0) {
      return (num / 1000) + 'k';
    }
    return formatPrice(priceStr, defaultPrice);
  };
  
  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Drag to Scroll State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  const handleOrderPaket1 = () => {
    setSelectedPaket("super_power");
    setIsOrderModalOpen(true);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    // Add a slight delay for mobile menu closing animation before scrolling
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        // We use offsetTop with a custom offset to ensure it lands perfectly
        const headerOffset = 90; // Approx navbar height + breathing room
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
    
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 50);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (carouselRef.current) {
      setStartX(e.pageX - carouselRef.current.offsetLeft);
      setStartScrollLeft(carouselRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = startScrollLeft - walk;
  };

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const nextSlide = scrollLeft > 120 ? 1 : 0;
      setActiveSlide((prev) => (prev !== nextSlide ? nextSlide : prev));
    }
  };

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      // Use a fixed max value to avoid reading layout properties and guarantee end-reach
      carouselRef.current.scrollTo({
        left: index === 0 ? 0 : 800,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };
  
  // Teks Marketing Bergantian
  const marketingTexts = [
    "Dapatkan akses resmi Google AI Pro termurah...",
    "Tingkatkan produktivitas tanpa batas dengan AI...",
    "Optimalkan performa kerjamu bersama Gemini Advanced..."
  ];
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = marketingTexts[textIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    // Pause ketika teks selesai diketik penuh
    if (!isDeleting && typedText === currentText) {
      const timeout = setTimeout(() => setIsDeleting(true), 2500);
      return () => clearTimeout(timeout);
    }

    // Ganti ke teks berikutnya setelah terhapus habis
    if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % marketingTexts.length);
      return;
    }

    // Proses mengetik / menghapus per huruf
    const timeout = setTimeout(() => {
      setTypedText((prev) => 
        isDeleting ? currentText.slice(0, prev.length - 1) : currentText.slice(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, textIndex]);

  return (
    <div className="relative bg-[#f8f9fa] font-sans overflow-x-hidden selection:bg-[#20283e] selection:text-white">
      {/* Decorative Container Borders (Left & Right Lines) */}
      <div 
        className="absolute inset-0 w-full max-w-[1200px] mx-auto border-x border-slate-300/40 pointer-events-none z-[1]"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 300px)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 300px)' }}
      />
      
      <GiveawayWidget settings={settings} />
      <main className="relative min-h-screen w-full flex flex-col bg-gradient-to-b from-[#7ec5f2] via-[#b6dff6] to-[#f8f9fa]">
        
        {/* Soft white gradient overlay at the top to blend smoothly with the header */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
      
      {/* Animated Clouds & Stars Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Faint Stars */}
        <svg className="absolute w-full h-[50%] opacity-70" xmlns="http://www.w3.org/2000/svg">
           <circle cx="10%" cy="15%" r="1" fill="white" />
           <circle cx="45%" cy="8%" r="1.5" fill="white" opacity="0.9" />
           <circle cx="80%" cy="20%" r="1" fill="white" />
           <circle cx="35%" cy="30%" r="1" fill="white" opacity="0.6" />
           <circle cx="65%" cy="12%" r="1" fill="white" />
           <circle cx="90%" cy="28%" r="1.2" fill="white" opacity="0.8" />
        </svg>

        {/* Meteor Shower Animation */}
        <MeteorShower />

        {/* Dynamic Parallax Smoke Clouds */}
        <SmokeCloud className="top-[5%] scale-75 sm:scale-100" duration={50} delay={-15} />
        <SmokeCloud className="top-[25%] scale-90 sm:scale-125" duration={70} delay={-35} />
        <SmokeCloud className="top-[45%] scale-110 sm:scale-150 opacity-90" duration={60} delay={-5} />
        <SmokeCloud className="top-[15%] scale-50 sm:scale-75 opacity-70" duration={85} delay={-50} />
        <SmokeCloud className="top-[50%] scale-125 sm:scale-[1.8] opacity-100" duration={80} delay={-25} />
      </div>

      {/* NAVIGATION BAR - Glassmorphism Fixed Header */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ willChange: "background-color, height" }}
        className={`fixed top-0 left-0 w-full z-50 flex flex-col backdrop-blur-md overflow-hidden transform-gpu transition-colors duration-300 ${isMenuOpen ? "bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_80%,rgba(255,255,255,0)_100%)]" : "bg-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"}`}
      >
        {/* Top Bar (Logo, Desktop Links & Mobile Toggle) */}
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between py-4 px-5">
          {/* Brand Logo */}
          <div className={`flex items-center text-[#181d28] text-[20px] sm:text-[24px] tracking-tight ${quicksand.className} font-bold z-10 relative`}>
            DevTech AI Stor
            <span className="bg-[#181d28] text-white px-1 ml-[2px] rounded-[4px] leading-none pb-[2px] flex items-center justify-center">
              e
            </span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#beranda" onClick={(e) => handleNavClick(e, 'beranda')} className="text-[14px] font-medium text-[#475569] hover:text-[#1b59d9] transition-colors">Beranda</a>
            <a href="#paket-harga" onClick={(e) => handleNavClick(e, 'paket-harga')} className="text-[14px] font-medium text-[#475569] hover:text-[#1b59d9] transition-colors">Paket Harga</a>
            <a href="#keunggulan-fitur" onClick={(e) => handleNavClick(e, 'keunggulan-fitur')} className="text-[14px] font-medium text-[#475569] hover:text-[#1b59d9] transition-colors">Keunggulan Fitur</a>
            <a href="#testimoni" onClick={(e) => handleNavClick(e, 'testimoni')} className="text-[14px] font-medium text-[#475569] hover:text-[#1b59d9] transition-colors">Ekosistem</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-[14px] font-medium text-[#475569] hover:text-[#1b59d9] transition-colors">Panduan</a>
            <button onClick={() => setIsRedeemModalOpen(true)} className="bg-black hover:bg-slate-900 text-white font-semibold text-[13px] py-2 px-5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5">
              <Lock size={14} className="opacity-70" /> Klaim Pesanan
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#181d28] hover:opacity-70 transition-opacity w-10 h-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div 
                  key="close" 
                  initial={{ opacity: 0, rotate: -90 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  exit={{ opacity: 0, rotate: 90 }} 
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-7 h-7" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div 
                  key="menu" 
                  initial={{ opacity: 0, rotate: 90 }} 
                  animate={{ opacity: 1, rotate: 0 }} 
                  exit={{ opacity: 0, rotate: -90 }} 
                  transition={{ duration: 0.2 }} 
                  className="flex flex-col gap-[5px]"
                >
                  <div className="w-[22px] h-[2px] bg-[#181d28] rounded-full"></div>
                  <div className="w-[22px] h-[2px] bg-[#181d28] rounded-full"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Dropdown Links */}
        <div className="md:hidden">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Smooth Deceleration
                style={{ willChange: "height" }}
                className="w-full overflow-hidden transform-gpu"
              >
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                  className="w-full flex flex-col items-center gap-10 pt-8 pb-20 transform-gpu"
                >
                  <a href="#beranda" onClick={(e) => handleNavClick(e, 'beranda')} className="text-[15px] font-medium text-[#181d28] hover:text-[#1b59d9] transition-colors">Beranda</a>
                  <a href="#paket-harga" onClick={(e) => handleNavClick(e, 'paket-harga')} className="text-[15px] font-medium text-[#181d28] hover:text-[#1b59d9] transition-colors">Paket Harga</a>
                  <a href="#keunggulan-fitur" onClick={(e) => handleNavClick(e, 'keunggulan-fitur')} className="text-[15px] font-medium text-[#181d28] hover:text-[#1b59d9] transition-colors">Keunggulan Fitur</a>
                  <a href="#testimoni" onClick={(e) => handleNavClick(e, 'testimoni')} className="text-[15px] font-medium text-[#181d28] hover:text-[#1b59d9] transition-colors">Ekosistem</a>
                  <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-[15px] font-medium text-[#181d28] hover:text-[#1b59d9] transition-colors">Panduan</a>
                  
                  <button onClick={() => { setIsMenuOpen(false); setIsRedeemModalOpen(true); }} className="mt-4 bg-black hover:bg-slate-900 text-white font-bold text-[15px] py-3 px-10 rounded-full shadow-lg transition-colors inline-flex items-center justify-center gap-2">
                    <Lock size={16} className="opacity-70" /> Klaim Pesanan
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div id="beranda" className="relative z-10 flex-grow flex flex-col items-center px-4 text-center w-full pb-24">
        <ScrollReveal y={20} className="flex-grow flex flex-col w-full">
          {/* Text Container vertically centered */}
          <div className="flex-grow flex flex-col justify-center w-full min-h-[40vh] pt-16 sm:pt-20 mt-20 sm:mt-24 md:mt-16">
            <h1 className="text-[22px] sm:text-3xl md:text-4xl font-medium text-[#2d3748] leading-relaxed w-full max-w-3xl mx-auto">
              Akses Penuh Google AI Pro<br />
              Gemini 3.1 Pro<br />
              Harga Paling Hemat
            </h1>
            
            <p className="mt-8 text-[14px] sm:text-base md:text-lg text-[#4a5568] w-full max-w-2xl mx-auto leading-relaxed">
              Dapatkan akses resmi Gemini 3.1 Pro dengan Deep Research, Workspace Intelligence,<br />
              dan limit token hemat yang refresh setiap 5 jam, ideal untuk programmer & profesional.
            </p>
          </div>

          {/* Search Box Outer Shell (Glassmorphism Double Border) - Pushed to bottom */}
          <div className="mt-12 mb-6 w-full max-w-[90%] sm:max-w-2xl p-[6px] rounded-[32px] border border-slate-300/30 bg-slate-100/20 backdrop-blur-sm shadow-sm relative z-20 mx-auto">
            <div className="w-full bg-white rounded-[26px] p-6 shadow-[0_10px_40px_rgb(0,0,0,0.05)] border border-slate-100/80 text-left flex flex-col h-[200px] relative">
              <div className="flex-grow pt-2">
                <span className="text-[#8492a6] font-medium text-[15px] sm:text-lg">
                  {typedText}
                  <span className="inline-block w-[6px] h-[18px] sm:h-[22px] bg-[#e2e8f0] animate-pulse align-middle ml-[2px] -mt-[2px]"></span>
                </span>
              </div>
              
              {/* Button Container */}
              <div 
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
                className="absolute bottom-5 right-5 bg-[#f3f4f6] rounded-[20px] p-[6px] flex flex-col items-center justify-center min-w-[140px] cursor-pointer"
              >
                <AnimatePresence>
                  {isBtnHovered && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: 8 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="overflow-hidden w-full flex justify-center"
                    >
                      <span className="text-[12px] text-[#8492a6] font-bold pb-2 pt-1">Resmi & Bergaransi!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <a href="#paket-harga" className="w-full bg-white border border-[#e5e9f2] text-[#20283e] font-semibold py-2.5 px-5 rounded-[14px] shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-colors text-[14px] cursor-pointer text-center block">
                  Order Sekarang
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>


      </main>

      {/* Stats & Global Curriculum Section */}
      <section id="keunggulan-fitur" className="relative w-full py-24 px-6 sm:px-10 flex flex-col items-center bg-[#f8f9fa] z-10">
<ScrollReveal>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-x-8 sm:gap-x-24 gap-y-12 sm:gap-y-14 w-full max-w-[600px] mb-28 mx-auto text-center">
          <div className="flex flex-col items-center">
            <span className={`text-[24px] sm:text-[28px] font-medium text-[#1c1d20] mb-2 leading-none tracking-tight ${quicksand.className}`}>
              <CountUp to={89} suffix="+" />
            </span>
            <span className="text-[#6b7280] text-[14px] sm:text-[15px]">Pelanggan Aktif</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-[24px] sm:text-[28px] font-medium text-[#1c1d20] mb-2 leading-none tracking-tight ${quicksand.className}`}>
              <CountUp to={125} suffix="+" />
            </span>
            <span className="text-[#6b7280] text-[14px] sm:text-[15px]">Total Transaksi</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-[24px] sm:text-[28px] font-medium text-[#1c1d20] mb-2 leading-none tracking-tight ${quicksand.className}`}>
              <CountUp to={10} suffix="x" />
            </span>
            <span className="text-[#6b7280] text-[14px] sm:text-[15px] leading-relaxed">Peningkatan<br />Produktivitas Kerja</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-[24px] sm:text-[28px] font-medium text-[#1c1d20] mb-2 leading-none tracking-tight ${quicksand.className}`}>
              <CountUp to={100} suffix="%" />
            </span>
            <span className="text-[#6b7280] text-[14px] sm:text-[15px] leading-relaxed">Akses Resmi & Aman</span>
          </div>
          <div className="flex flex-col col-span-2 sm:col-span-1 items-center">
            <span className={`text-[24px] sm:text-[28px] font-medium text-[#1c1d20] mb-2 leading-none tracking-tight ${quicksand.className}`}>
              <CountUp to={99} suffix="%" />
            </span>
            <span className="text-[#6b7280] text-[14px] sm:text-[15px]">Tingkat Kepuasan Pelanggan</span>
          </div>
        </div>

        {/* Black Card */}
        <div className="bg-black w-full max-w-[700px] rounded-[40px] pt-16 pb-24 px-4 sm:px-8 flex flex-col items-center relative min-h-screen overflow-hidden">
          <ScrollReveal y={20}>
            <h2 className="text-white text-2xl sm:text-[28px] font-bold mb-4 text-center z-10">Kuasai Kekuatan Gemini 3.1 Pro</h2>
            <p className="text-[#e5e7eb] text-[14px] sm:text-[15px] text-center max-w-lg leading-relaxed z-10 font-medium mx-auto">
              Rasakan performa Gemini 3.1 Pro, model AI terkuat dari Google untuk reasoning mendalam, coding intensif, dan analisis data kompleks. Dilengkapi Deep Research, Workspace Intelligence, dan context window 1 juta token. Semua premium, harga super hemat.
            </p>
          </ScrollReveal>
          
          {/* ASCII Globe */}
          <ScrollReveal delay={0.2} y={30}>
            <div className="relative mt-12 mb-16 text-[7px] sm:text-[9px] text-gray-500 font-mono leading-[1.1] text-center select-none opacity-80 w-full flex justify-center" style={{ letterSpacing: '0.15em' }}>
              <AsciiGlobe />
            </div>
          </ScrollReveal>
          
          {/* Inner Feature Cards */}
          <div className="flex flex-col gap-6 w-full max-w-[550px] z-10">
            {/* Card 1 */}
            <ScrollReveal y={40}>
              <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col items-center justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Gemini Deep Research</h3>
                <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                  Agen riset otonom yang menjelajahi web & data Google Workspace Anda, melakukan investigasi multi-langkah, lalu menyusun laporan komprehensif lengkap dengan sumber dan kutipan.
                </p>
              </div>
            </ScrollReveal>
            
            {/* Card 2 */}
            <ScrollReveal y={40}>
              <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col items-center justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Context Window 1 Juta Token</h3>
                <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                  Unggah dan analisis ratusan halaman dokumen, ribuan baris kode, hingga video panjang dalam satu sesi. Gemini 3.1 Pro memproses semua tanpa kehilangan detail sekecil apapun.
                </p>
              </div>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal y={40}>
              <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col items-center justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Workspace Intelligence</h3>
                <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                  AI terintegrasi penuh ke Gmail, Docs, Sheets, Slides, Drive, dan Calendar. Otomatisasi draf email, rangkum dokumen, dan ekstrak insight secara real-time di seluruh ekosistem Google.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* New Section: Kolaborasi AI 1-on-1 */}
          <div className="mt-32 flex flex-col items-center w-full">
            <ScrollReveal y={20}>
              <h2 className="text-white text-2xl sm:text-[32px] font-bold mb-4 text-center z-10">Senjata Rahasia Programmer</h2>
              <p className="text-[#e5e7eb] text-[14px] sm:text-[15px] text-center max-w-lg leading-relaxed z-10 font-medium mx-auto">
                Limit token berlapis ganda yang refresh setiap 5 jam. Ideal untuk coding intensif di Antigravity IDE dan tools AI coding lainnya. Tingkatkan produktivitas coding Anda 10x lipat.
              </p>
            </ScrollReveal>
            
            {/* ASCII Gemini Star */}
            <ScrollReveal delay={0.2} y={30}>
              <div className="relative mt-16 mb-16 w-full flex justify-center z-10">
                <AsciiGeminiStar />
              </div>
            </ScrollReveal>
            
            {/* Inner Feature Cards for 1-on-1 Section */}
            <div className="flex flex-col gap-6 w-full max-w-[550px] z-10">
              {/* Card 1 */}
              <ScrollReveal y={40}>
                <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                  <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Token Lebih Hemat & Refresh Cepat</h3>
                  <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                    Sistem komputasi canggih yang membuat penggunaan token di Antigravity jauh lebih hemat. Kuota Anda akan ter-refresh otomatis dengan cepat, memastikan Anda bisa terus ngoding tanpa hambatan.
                  </p>
                </div>
              </ScrollReveal>
              
              {/* Card 2 */}
              <ScrollReveal y={40}>
                <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                  <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Custom Gems & Canvas Mode</h3>
                  <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                    Buat asisten AI khusus (Gems) untuk tugas coding berulang. Gunakan Canvas Mode untuk mengedit Docs & Slides langsung dalam Gemini tanpa berpindah tab.
                  </p>
                </div>
              </ScrollReveal>
              
              {/* Card 3 */}
              <ScrollReveal y={40}>
                <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                  <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Image & Video Generation</h3>
                  <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                    Buat gambar dan video berkualitas tinggi langsung dari teks. Didukung Veo 3.1 untuk konten visual profesional dan sinematik dari prompt sederhana.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* New Section: Integrasi Pembelajaran dengan AI */}
          <div className="mt-32 flex flex-col items-center w-full">
            <ScrollReveal y={20}>
              <h2 className="text-white text-2xl sm:text-[32px] font-bold mb-4 text-center z-10">Ekosistem AI Terlengkap</h2>
              <p className="text-[#e5e7eb] text-[14px] sm:text-[15px] text-center max-w-lg leading-relaxed z-10 font-medium mx-auto">
                Gemini Notebook (NotebookLM), Gemini Spark Agent, 5 TB Cloud Storage, dan akses dini fitur masa depan Google, semuanya dalam satu paket AI Pro.
              </p>
            </ScrollReveal>
            
            {/* ASCII AI Dice */}
            <ScrollReveal delay={0.2} y={30}>
              <div className="relative mt-16 mb-16 w-full flex justify-center z-10">
                <AsciiAIDice />
              </div>
            </ScrollReveal>
            
            {/* Inner Feature Cards for Integrasi Section */}
            <div className="flex flex-col gap-6 w-full max-w-[550px] z-10">
              {/* Card 1 */}
              <ScrollReveal y={40}>
                <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                  <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Gemini Notebook & Audio Overview</h3>
                  <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                    Unggah dokumen untuk mendapatkan insight instan, mind map interaktif, dan Audio Overview seperti podcast. Ruang riset pribadi yang memahami konteks dokumen Anda.
                  </p>
                </div>
              </ScrollReveal>
              
              {/* Card 2 */}
              <ScrollReveal y={40}>
                <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">

                  <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Gemini Spark Agent<br/>& 5 TB Storage</h3>
                  <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                    Asisten AI yang bertindak atas nama Anda untuk kelola kalender, booking jadwal, dan kirim reminder otomatis. Ditambah 5 TB cloud storage untuk Google Drive, Gmail, dan Photos.
                  </p>
                </div>
              </ScrollReveal>

              {/* Card 3 */}
              <ScrollReveal y={40}>
                <div className="border border-white/15 rounded-[32px] p-8 sm:p-10 flex flex-col justify-center w-full bg-[#050505] shadow-xl hover:border-white/30 transition-colors">
                  <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4 text-center">Dukungan Pelanggan Responsif</h3>
                  <p className="text-[#a1a1aa] text-[14px] sm:text-[15px] text-center leading-relaxed">
                    Tim dukungan teknis kami selalu siap membantu memastikan setiap pertanyaan dan kendala Anda terselesaikan dengan baik. Anda tidak pernah berjuang sendirian.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </ScrollReveal>
</section>

      {/* Global Infrastructure Section */}
      <section id="testimoni" className="w-full bg-gradient-to-b from-[#f8f9fa] to-[#f4f6f9] py-24 flex flex-col items-center px-4 z-10 relative -mt-1">
<ScrollReveal>
        <h2 className="text-[28px] sm:text-[32px] font-semibold text-[#0f172a] mb-6 text-center">
          Otoritas Teknologi Kelas Dunia
        </h2>
        
        <p className="text-[#475569] text-[15px] sm:text-[16px] text-center max-w-[600px] leading-relaxed mb-10">
          Infrastruktur komputasi di balik Google AI Pro dirancang oleh insinyur terbaik di planet ini. Mesin kecerdasan buatan kami menjadi tulang punggung revolusi digital dan dipercaya penuh oleh raksasa teknologi global.
        </p>
        
        <button onClick={() => setIsEcosystemModalOpen(true)} className="bg-white border border-[#e2e8f0] rounded-full py-2 pl-6 pr-2 flex items-center justify-center gap-4 hover:shadow-md transition-shadow mb-20 shadow-sm cursor-pointer mx-auto w-fit">
          <span className="text-[#0f172a] font-medium text-[15px]">Jelajahi integrasi ekosistem</span>
          <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowRight size={18} />
          </div>
        </button>
        
        <p className="text-[#94a3b8] text-[15px] font-medium mb-8 text-center">
          Terintegrasi sempurna di seluruh ekosistem produk Google
        </p>
        
        <div className="relative w-full max-w-[1200px] overflow-hidden px-0">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 12s linear infinite;
              will-change: transform;
              transform: translateZ(0);
            }
          `}} />
          
          {/* Gradient Masks for fading effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f4f6f9] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f4f6f9] to-transparent z-10 pointer-events-none"></div>
          
          {/* Animated Marquee Container */}
          <div className="animate-marquee gap-4 sm:gap-6 items-center py-4">
            {/* We render the list twice to create a seamless infinite loop */}
            {[...Array(2)].map((_, loopIndex) => (
              <React.Fragment key={loopIndex}>
                {[
                  { 
                    name: 'Google Workspace', 
                    color: 'text-gray-800',
                    icon: <img src="/Google_Apps_for_Work_icon.webp" alt="Workspace" className="w-[36px] h-[36px] object-contain" />
                  },
                  { 
                    name: 'Google Cloud', 
                    color: 'text-gray-800',
                    icon: <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="Cloud" width="36" height="36" />
                  },
                  { 
                    name: 'Antigravity', 
                    color: 'text-gray-800',
                    icon: <img src="/google-antigravity.png" alt="Antigravity" className="w-[36px] h-[36px] object-contain" />
                  },
                  { 
                    name: 'Gemini Pro', 
                    color: 'text-gray-900',
                    icon: <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.svg" alt="Gemini" width="36" height="36" />
                  },
                  { 
                    name: 'NotebookLM', 
                    color: 'text-gray-800',
                    icon: <img src="/notebook-lm.jpg" alt="NotebookLM" className="w-[36px] h-[36px] object-contain rounded-md" />
                  },
                  { 
                    name: 'Google FLOW', 
                    color: 'text-gray-800',
                    icon: <img src="/google-flow.webp" alt="Google FLOW" className="w-[36px] h-[36px] object-contain rounded-md" />
                  },
                  { 
                    name: 'AI Studio PRO', 
                    color: 'text-gray-800',
                    icon: <img src="/ai-studio.png" alt="AI Studio" className="w-[36px] h-[36px] object-contain" />
                  },
                  { 
                    name: 'Firebase AI', 
                    color: 'text-[#EA580C]',
                    icon: <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" alt="Firebase" width="36" height="36" />
                  },
                ].map((product, idx) => (
                  <div key={`${loopIndex}-${idx}`} className="bg-white rounded-[24px] w-[200px] sm:w-[240px] h-[100px] sm:h-[110px] flex items-center justify-center gap-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-4 shrink-0 border border-slate-100 mx-2 sm:mx-3 transition-all hover:scale-105 hover:shadow-lg cursor-default">
                    <div className="shrink-0 flex items-center justify-center">
                      {product.icon}
                    </div>
                    <span className={`${product.color} font-bold tracking-tight text-[15px] sm:text-[17px] text-left leading-tight`}>
                      {product.name}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </ScrollReveal>
</section>

      {/* Scholarship Section */}
      <section id="paket-harga" className="w-full bg-gradient-to-b from-[#f4f6f9] via-[#EBF3FC] to-white py-24 flex flex-col items-center relative overflow-hidden -mt-1 scroll-mt-20 sm:scroll-mt-24">
<ScrollReveal>
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}} />
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0f172a] mb-5 text-center leading-tight tracking-tight px-8">
          Akses Kekuatan Penuh <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI Pro</span><br/>Tanpa Menguras Kantong
        </h2>
        
        <p className="text-[#475569] text-[14px] sm:text-[15px] text-center leading-relaxed mb-10 sm:mb-12 px-10 sm:px-4 max-w-[550px]">
          Ribuan profesional telah membuktikan kehebatannya. Kini giliran Anda! Pilih paket super hemat yang paling pas dengan kebutuhan produktivitas harian Anda.
        </p>
        
        <div 
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`w-full max-w-[1200px] flex md:justify-center items-stretch gap-6 px-[calc(50%-150px)] sm:px-[calc(50%-160px)] md:px-12 overflow-x-auto pb-12 scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'}`} 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          
          {/* Card 1 */}
          <div className="snap-center shrink-0 w-[85vw] max-w-[300px] sm:max-w-none sm:w-[320px] p-3 sm:p-4 rounded-[32px] bg-gradient-to-b from-[#2A4B7C] to-[#545C66] shadow-xl relative h-auto flex flex-col">
            <div className="bg-white rounded-[24px] w-full h-full flex flex-col p-5">
              {/* Browser Dots */}
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              
              {/* Image Graphic Recreated */}
              <div className="w-[140px] h-[140px] bg-[#FFF8E7] rounded-xl mx-auto mb-4 flex flex-col items-center justify-center p-3 relative shadow-inner overflow-hidden border border-[#FEF3C7]">
                 <div className="absolute top-2 left-2 z-20"><Zap size={18} className="text-[#60A5FA] opacity-80" /></div>
                 <div className="absolute bottom-2 right-2 z-20"><Sparkles size={18} className="text-[#FCD34D]" /></div>
                 <div className="bg-[#1E3A8A] text-white w-[110%] rotate-[-4deg] py-3 px-2 text-center rounded-sm shadow-md border-2 border-dashed border-white/30 z-10">
                    <span className="font-serif italic font-bold text-[22px] leading-[1.1] block">Super<br/>Power</span>
                 </div>
                 <p className="text-[#1E3A8A] font-bold text-[9px] mt-3 text-center z-10 leading-tight">
                    Paling<br/><span className="text-gray-600 font-normal">Recommended!</span>
                 </p>
              </div>
              
              <h3 className="text-[17px] sm:text-[19px] font-semibold text-gray-900 text-center mb-1">
                Paket 1: Super Power
              </h3>
              
              <p className="text-[12px] text-red-500 font-bold text-center mb-3">Aktivasi Mandiri (18 Bulan)</p>
              
              <div className="flex justify-center items-center gap-2 mb-4">
                 <span className="text-[12px] text-gray-400 line-through">Rp{formatPrice(settings?.pricing?.paket1?.hargaNormal, "75000")}</span>
                 <span className="text-[20px] font-bold text-[#1E3A8A]">Rp{formatPrice(settings?.pricing?.paket1?.hargaPromo, "55000")}</span>
              </div>

              <ul className="text-[11px] text-gray-600 space-y-2 mb-4 px-2">
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> <span>Masa aktif 18 bulan penuh</span></li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> <span>Anda kelola sendiri (No login & No password)</span></li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> <span>Klik link → aktifkan langsung di akun Google Anda</span></li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> <span>Tidak perlu kartu kredit / metode pembayaran</span></li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> <span>Bisa invite hingga 5 anggota keluarga (Family Sharing)</span></li>
              </ul>
              
              <p className="text-[11px] text-gray-500 text-center leading-relaxed mb-5 font-medium px-2 italic mt-auto">
                "Paling banyak dipilih: praktis, akun tetap aman, bisa invite keluarga."
              </p>
              
              <button onClick={handleOrderPaket1} className="border border-gray-200 rounded-xl py-2 px-6 flex items-center justify-center gap-2 mx-auto text-[14px] font-medium text-gray-800 hover:bg-gray-50 transition-colors w-fit shadow-sm cursor-pointer">
                Pilih Paket <ArrowRight size={16} className="-rotate-45" />
              </button>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="snap-center shrink-0 w-[85vw] max-w-[300px] sm:max-w-none sm:w-[320px] p-3 sm:p-4 rounded-[32px] bg-gradient-to-b from-[#475569] to-[#94A3B8] shadow-xl relative h-auto flex flex-col">
            <div className="bg-white rounded-[24px] w-full h-full flex flex-col p-5">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              
              <div className="w-[140px] h-[140px] bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center border border-slate-200 shadow-inner overflow-hidden relative">
                 <div className="absolute top-2 right-2 z-20"><Users size={18} className="text-[#94A3B8] opacity-80" /></div>
                 <div className="bg-indigo-600 text-white w-[110%] rotate-[3deg] py-3 px-2 text-center rounded-sm shadow-md border-2 border-dashed border-white/30 z-10">
                    <span className="font-serif italic font-bold text-[20px] leading-[1.1] block">Invitation<br/>Group</span>
                 </div>
              </div>
              
              <h3 className="text-[17px] sm:text-[19px] font-semibold text-gray-900 text-center mb-1">
                Paket 2: Invitation
              </h3>
              <p className="text-[12px] text-indigo-500 font-bold text-center mb-3">Via Google Family (Durasi Fleksibel)</p>
              <div className="bg-slate-50/80 rounded-[16px] p-2.5 mb-3 border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px] text-gray-500 font-medium">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center">
                    <span>1 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan1, "15000")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>7 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan7, "40000")}</span>
                  </div>
                  {/* Row 2 */}
                  <div className="flex justify-between items-center">
                    <span>2 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan2, "20000")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>8 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan8, "40000")}</span>
                  </div>
                  {/* Row 3 */}
                  <div className="flex justify-between items-center">
                    <span>3 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan3, "25000")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>9 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan9, "45000")}</span>
                  </div>
                  {/* Row 4 */}
                  <div className="flex justify-between items-center">
                    <span>4 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan4, "30000")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>10 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan10, "45000")}</span>
                  </div>
                  {/* Row 5 */}
                  <div className="flex justify-between items-center">
                    <span>5 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan5, "35000")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>11 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan11, "50000")}</span>
                  </div>
                  {/* Row 6 */}
                  <div className="flex justify-between items-center">
                    <span>6 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan6, "35000")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>12 Bln</span><span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{formatShortPrice(settings?.pricing?.paket2?.bulan12, "50000")}</span>
                  </div>
                </div>
              </div>

              <ul className="text-[10.5px] text-gray-600 space-y-1.5 mb-4 px-2 mt-auto">
                 <li className="flex gap-2 items-start"><CheckCircle2 size={13} className="text-indigo-500 shrink-0 mt-0.5" /> <span>Kirim email Anda → kami invite ke Google Family</span></li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={13} className="text-indigo-500 shrink-0 mt-0.5" /> <span>Terima undangan di email → AI Pro langsung aktif</span></li>
                 <li className="flex gap-2 items-start"><CheckCircle2 size={13} className="text-indigo-500 shrink-0 mt-0.5" /> <span>Tidak perlu login, password, atau kartu kredit</span></li>
              </ul>
              
              <button onClick={() => { setSelectedPaket("invitation"); setIsOrderModalOpen(true); }} className="border border-gray-200 rounded-xl py-2 px-6 flex items-center justify-center gap-2 mx-auto text-[14px] font-medium text-gray-800 hover:bg-gray-50 transition-colors w-fit shadow-sm cursor-pointer">
                Pilih Paket <ArrowRight size={16} className="-rotate-45" />
              </button>
            </div>
          </div>
          
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-6 -mt-2 mb-4 relative z-10">
          <button 
            onClick={() => scrollToSlide(0)}
            disabled={activeSlide === 0}
            className={`w-[46px] h-[46px] rounded-full border border-gray-200 bg-white flex items-center justify-center transition-colors shadow-sm ${activeSlide === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#0f172a] hover:bg-gray-50 cursor-pointer'}`}
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-2">
            <div onClick={() => scrollToSlide(0)} className={`cursor-pointer rounded-full transition-all duration-500 ease-out ${activeSlide === 0 ? 'w-8 h-2.5 bg-[#0f172a]' : 'w-2.5 h-2.5 bg-gray-300'}`}></div>
            <div onClick={() => scrollToSlide(1)} className={`cursor-pointer rounded-full transition-all duration-500 ease-out ${activeSlide === 1 ? 'w-8 h-2.5 bg-[#0f172a]' : 'w-2.5 h-2.5 bg-gray-300'}`}></div>
          </div>

          <button 
            onClick={() => scrollToSlide(1)}
            disabled={activeSlide === 1}
            className={`w-[46px] h-[46px] rounded-full border border-gray-200 bg-white flex items-center justify-center transition-colors shadow-sm ${activeSlide === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#0f172a] hover:bg-gray-50 cursor-pointer'}`}
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>
      </ScrollReveal>
</section>

      {/* Activation & Invite Guide Section */}
      <section id="faq" className="w-full bg-white py-20 flex flex-col items-center px-6 -mt-1">
<ScrollReveal className="w-full flex flex-col items-center">
        <div className="max-w-[700px] w-full flex flex-col items-center text-center">
          <h2 className="text-[28px] sm:text-[32px] font-bold mb-6 text-[#0f172a]">
            Panduan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Aktivasi & Akses Grup</span>
          </h2>
          <p className="text-[#475569] text-[15px] sm:text-[17px] leading-relaxed px-4 sm:px-12 mb-14">
            <strong>Paket 1 (Super Power):</strong> Anda akan menerima link aktivasi resmi, cukup buka dan klik Aktifkan di akun Google Anda. Setelah aktif, Anda bisa mengundang hingga 5 anggota keluarga via Family Sharing.<br/><br/>
            <strong>Paket 2 (Invitation):</strong> Kirimkan email Google Anda, kami akan mengirim undangan Google Family. Terima undangan di inbox email → lisensi AI Pro langsung aktif sesuai durasi yang dipilih.
          </p>

          {/* Video Tutorial Cards Container */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch w-full max-w-[900px] mx-auto">
            {/* Video Tutorial Card 1 */}
            <div className="bg-black rounded-[32px] p-5 w-full max-w-[340px] sm:max-w-[400px] flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-left hover:-translate-y-1 transition-transform duration-300 flex-1">
              <img 
                src="/tutorial_thumbnail.png" 
                alt="Video Tutorial" 
                className="w-full h-auto aspect-[4/3] object-cover rounded-[20px]" 
              />
              <div className="flex flex-col gap-4 px-1 pb-2 mt-1 flex-1">
                <h3 className="text-white text-[19px] sm:text-[21px] font-bold leading-snug">
                  Panduan Aktivasi Paket 1 (Super Power)
                </h3>
                <button onClick={() => handleOpenTutorial("paket1")} className="bg-white text-[#0f172a] rounded-[14px] py-3 px-5 flex items-center justify-center gap-2 font-semibold text-[15px] hover:bg-gray-100 transition-colors w-fit mt-auto shadow-sm">
                  <Play size={18} strokeWidth={2.5} /> Minta Panduan
                </button>
              </div>
            </div>

            {/* Video Tutorial Card 2 */}
            <div className="bg-black rounded-[32px] p-5 w-full max-w-[340px] sm:max-w-[400px] flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-left hover:-translate-y-1 transition-transform duration-300 flex-1">
              <img 
                src="/tutorial_thumbnail_2.png" 
                alt="Video Tutorial 2" 
                className="w-full h-auto aspect-[4/3] object-cover rounded-[20px]" 
              />
              <div className="flex flex-col gap-4 px-1 pb-2 mt-1 flex-1">
                <h3 className="text-white text-[19px] sm:text-[21px] font-bold leading-snug">
                  Cara Invite Keluarga (Family Sharing) via Akun Head
                </h3>
                <button onClick={() => handleOpenTutorial("family")} className="bg-white text-[#0f172a] rounded-[14px] py-3 px-5 flex items-center justify-center gap-2 font-semibold text-[15px] hover:bg-gray-100 transition-colors w-fit mt-auto shadow-sm">
                  <Play size={18} strokeWidth={2.5} /> Minta Panduan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Talent CTA Card */}
        <div className="mt-28 w-full max-w-[1200px] px-4 sm:px-6 mx-auto flex justify-center mb-4 relative z-10">
          {/* The outer border frame */}
          <div className="border border-[#e2e8f0] p-1.5 sm:p-2 rounded-[52px] bg-transparent w-full transition-all duration-300">
              {/* The inner white card */}
              <div className="bg-white rounded-[44px] flex flex-col md:flex-row items-center md:items-stretch pt-16 md:pt-0 pb-0 md:pb-0 px-8 md:pl-20 md:pr-0 overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.01)] border border-gray-50 md:h-[380px] lg:h-[420px]">
                
                {/* Text Content */}
                <div className="flex flex-col items-center md:items-start justify-center flex-1 md:py-16 z-10 text-center md:text-left min-w-[50%]">
                  <h2 className="text-[#0f172a] text-[28px] sm:text-[32px] md:text-[36px] lg:text-[42px] font-medium leading-[1.3] mb-8 lg:mb-10 tracking-tight">
                    Gabung Komunitas<br className="md:hidden"/> Eksklusif DevTech<br className="md:hidden"/> di WhatsApp
                  </h2>
                  <a href="https://chat.whatsapp.com/JpPApmNxF713hdKKJhc6lG" target="_blank" rel="noopener noreferrer" className="bg-[#18181b] text-white font-medium rounded-full py-3.5 px-8 text-[15px] sm:text-[16px] mb-12 md:mb-0 hover:bg-[#27272a] transition-colors w-fit shadow-md cursor-pointer block">
                    Gabung sekarang
                  </a>
                </div>
                
                {/* Image Content */}
                <div className="w-full md:w-[50%] flex justify-center md:justify-end items-end md:items-center mt-auto md:mt-0 relative px-4 md:pr-8 lg:pr-12 py-8 md:py-4">
                  <AsciiTree />
                </div>
              </div>
            </div>
          </div>
      </ScrollReveal>
</section>

      {/* Footer Section */}
      <footer className="relative w-full bg-gradient-to-b from-white to-[#f8f9fa] pt-24 pb-12 px-8 overflow-hidden flex flex-col -mt-1">
<ScrollReveal>
        {/* Animated Premium blue gradient glow */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute top-0 right-[10%] w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] bg-blue-500/20 sm:bg-blue-500/30 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none z-0"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -60, 40, 0],
            y: [0, 50, -40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-10 left-[10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-cyan-400/20 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none z-0"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, -50, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-1/2 left-1/3 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-400/15 rounded-full blur-[100px] pointer-events-none z-0"
        />

        <div className="w-full max-w-[1200px] mx-auto relative z-10 flex flex-col pt-4 px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between w-full">
            
            {/* Left: Alamat & Socials */}
            <div className="flex-1 max-w-[450px]">
              <h4 className="text-[#64748b] font-semibold text-[15px] mb-5">Alamat</h4>
              <p className="text-[#475569] text-[14px] leading-relaxed mb-6 font-medium">
                DevTech Space Jl. Layanan Digital No. 10,<br />
                Pusat Layanan Langganan Google AI Pro,<br />
                Beroperasi Online Seluruh Indonesia 40123
              </p>
              
              <div className="flex items-center gap-6 mt-8">
                <a href="https://www.tiktok.com/@devtech_official_store?_r=1&_t=ZS-98KjKmDZNMi" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform flex items-center justify-center w-[38px] h-[38px] rounded-full overflow-hidden shadow-sm border border-slate-200 bg-white">
                  <img src="/download.png" alt="TikTok" className="w-full h-full object-contain p-1.5" />
                </a>
              </div>
            </div>

            {/* Right: Link Columns */}
            <div className="flex flex-col sm:flex-row gap-12 sm:gap-24 lg:gap-32 mt-12 md:mt-0 lg:mr-8">
              <div className="w-[160px]">
                <h4 className="text-[#64748b] font-semibold text-[15px] mb-6">Company</h4>
                <ul className="flex flex-col gap-5 text-[#475569] font-semibold text-[14px]">
                  <li><a href="#beranda" onClick={(e) => handleNavClick(e, 'beranda')} className="hover:text-blue-600 transition-colors">Tentang Kami</a></li>
                  <li><a href="https://wa.me/6285872066832" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Hubungi Kami</a></li>
                  <li><button onClick={() => setIsRedeemModalOpen(true)} className="hover:text-blue-600 transition-colors flex items-center gap-2">Klaim Pesanan</button></li>
                  <li><a href="#beranda" onClick={(e) => handleNavClick(e, 'beranda')} className="hover:text-blue-600 transition-colors">Blog</a></li>
                  <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-blue-600 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div className="w-[160px]">
                <h4 className="text-[#64748b] font-semibold text-[15px] mb-6">Product</h4>
                <ul className="flex flex-col gap-5 text-[#475569] font-semibold text-[14px]">
                  <li><a href="#paket-harga" onClick={(e) => handleNavClick(e, 'paket-harga')} className="hover:text-blue-600 transition-colors">Paket Super Power</a></li>
                  <li><a href="#paket-harga" onClick={(e) => handleNavClick(e, 'paket-harga')} className="hover:text-blue-600 transition-colors">Paket Invitation</a></li>
                  <li><a href="#keunggulan-fitur" onClick={(e) => handleNavClick(e, 'keunggulan-fitur')} className="hover:text-blue-600 transition-colors">Keunggulan Fitur</a></li>
                  <li><a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-blue-600 transition-colors">Panduan Aktivasi</a></li>
                  <li><a href="https://wa.me/6285872066832?text=Halo%20DevTech%2C%20saya%20butuh%20bantuan%20teknis" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Bantuan Teknis</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[#64748b] font-medium w-full mt-24 relative z-20">
            <p>© 2026 DevTech | DevTech AI Store adalah platform lisensi resmi Google AI Pro di Indonesia.</p>
            <div className="flex items-center gap-4">
              <a href="#beranda" className="hover:text-blue-600 transition-colors">Terms</a>
              <span className="text-gray-300">|</span>
              <a href="#beranda" className="hover:text-blue-600 transition-colors">Privacy</a>
              <span className="text-transparent w-4"></span>
              <a href="/admin" className="text-gray-300 hover:text-blue-600 transition-colors flex items-center absolute -right-6" title="Admin Login">
                <Shield size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Large Background Text */}
        <div className="absolute bottom-[-5px] sm:-bottom-8 left-0 right-0 flex justify-center pointer-events-none select-none z-0 overflow-hidden">
          <span className="text-[70px] sm:text-[150px] lg:text-[200px] leading-none font-extrabold text-[#f1f5f9] mix-blend-multiply tracking-tighter opacity-100 whitespace-nowrap lowercase">devtech</span>
        </div>

      </ScrollReveal>
      </footer>

      {/* Floating Chat Button - WhatsApp (Always Visible) */}
      <a href="https://wa.me/6285872066832" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] z-50 hover:scale-105 hover:bg-[#1fb855] transition-all cursor-pointer">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Order Modal */}
      <OrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        paketType={selectedPaket}
        basePrice={settings?.pricing?.paket1?.hargaPromo}
      />

      {/* Ecosystem Modal */}
      <EcosystemModal
        isOpen={isEcosystemModalOpen}
        onClose={() => setIsEcosystemModalOpen(false)}
      />

      {/* Tutorial Video Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        title={tutorialData.title}
        videoUrl={tutorialData.videoUrl}
        passcode={tutorialData.passcode}
      />
      <RedeemModal isOpen={isRedeemModalOpen} onClose={() => setIsRedeemModalOpen(false)} initialPasscode={initialRedeemCode} />
    </div>
  );
}
