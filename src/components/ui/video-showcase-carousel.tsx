"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit,
  Terminal,
  Activity,
  CreditCard,
  Camera,
  CheckCircle2,
  Zap,
  Server,
  RefreshCw,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useLanguage } from "@/lib/i18n/language-context";

export interface ShowcaseCardItem {
  id: string;
  titleKey: { id: string; en: string };
  icon: React.ElementType;
  type: "github" | "cli" | "monitoring" | "checkout" | "snapshot";
  videoSrc?: string;
  posterSrc?: string;
}

export function VideoShowcaseCarousel() {
  const { t } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Active index of the center card (0..4)
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const DURATION_MS = 5000; // 5s auto-advance per card

  const cards: ShowcaseCardItem[] = [
    {
      id: "card-github",
      titleKey: {
        id: "Deploy dari GitHub",
        en: "Deploy from GitHub",
      },
      icon: GitCommit,
      type: "github",
    },
    {
      id: "card-cli",
      titleKey: {
        id: "Akses CLI dari Browser",
        en: "Access CLI from Browser",
      },
      icon: Terminal,
      type: "cli",
    },
    {
      id: "card-monitoring",
      titleKey: {
        id: "Live Telemetry Server",
        en: "Live Telemetry Server",
      },
      icon: Activity,
      type: "monitoring",
    },
    {
      id: "card-checkout",
      titleKey: {
        id: "Perpanjang Sewa Instan",
        en: "Instant Rental Extension",
      },
      icon: CreditCard,
      type: "checkout",
    },
    {
      id: "card-snapshot",
      titleKey: {
        id: "Snapshot & Backup Instant",
        en: "Instant Snapshot & Backup",
      },
      icon: Camera,
      type: "snapshot",
    },
  ];

  // Mobile viewport detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Circular Index helper
  const getCircularIndex = useCallback(
    (index: number) => {
      const len = cards.length;
      return ((index % len) + len) % len;
    },
    [cards.length]
  );

  // Auto-advance timer
  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, DURATION_MS);

    return () => clearInterval(timer);
  }, [prefersReducedMotion, cards.length]);

  // Manage video playback (only active center card plays)
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;

      if (idx === activeIndex && !prefersReducedMotion) {
        video.play().catch(() => {});
      } else {
        video.pause();
        if (idx !== activeIndex) {
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex, prefersReducedMotion]);

  // Handle Manual Jump
  const handleSelectCard = (index: number) => {
    setActiveIndex(getCircularIndex(index));
  };

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  // Keyboard navigation (Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  // Touch Drag gestures for mobile & desktop
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setTouchStartX(clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX === null) return;
    const clientX =
      "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diffX = touchStartX - clientX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Compute 5 relative positions for Desktop Coverflow (1 2 3 2 1)
  // Relative offsets: -2, -1, 0, 1, 2
  const getCardOffset = (index: number) => {
    const total = cards.length;
    let diff = index - activeIndex;
    // Handle circular wrap for shortest distance (-2, -1, 0, 1, 2)
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Video Showcase Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-live="polite"
      className="w-full max-w-6xl mx-auto py-6 space-y-6 focus:outline-none focus:ring-2 focus:ring-blue-600/40 rounded-3xl"
    >
      {/* Coverflow Stage Container */}
      <div
        className="relative w-full overflow-hidden select-none touch-pan-y"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isMobile ? (
          /* ========================================================= */
          /* MOBILE PEEK CAROUSEL (1 Dominant Center + ~15% Peek Edges) */
          /* ========================================================= */
          <div className="relative w-full py-4 flex items-center justify-center min-h-[300px]">
            {cards.map((card, idx) => {
              const offset = getCardOffset(idx);
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1; // Only center + immediate left/right peek

              if (!isVisible) return null;

              const Icon = card.icon;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => handleSelectCard(idx)}
                  initial={false}
                  animate={{
                    x: `${offset * 85}%`,
                    scale: isActive ? 1 : 0.85,
                    opacity: isActive ? 1 : 0.5,
                    zIndex: isActive ? 30 : 10,
                  }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 26 }
                  }
                  className="absolute w-[82vw] max-w-[340px] cursor-pointer"
                >
                  <div
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-900 border transition-all duration-300 ${
                      isActive
                        ? "border-blue-600 shadow-2xl ring-4 ring-blue-600/30"
                        : "border-slate-300 shadow-md"
                    }`}
                  >
                    {/* Floating Glassmorphism Title Pill */}
                    <div className="absolute top-3 left-3 z-30 px-3 py-1 bg-white/85 backdrop-blur-md border border-white/30 shadow-sm rounded-full flex items-center gap-1.5 text-navy-900 text-xs font-extrabold pointer-events-none">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t(card.titleKey.id, card.titleKey.en)}</span>
                    </div>

                    {card.videoSrc ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[idx] = el;
                        }}
                        src={card.videoSrc}
                        poster={card.posterSrc}
                        muted
                        playsInline
                        loop
                        preload={isActive ? "auto" : "none"}
                        onEnded={handleNext}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShowcaseVisualMockup type={card.type} isActive={isActive} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* DESKTOP / TABLET COVERFLOW CIRCULAR (1 2 3 2 1 Layout)     */
          /* ========================================================= */
          <div className="relative w-full py-8 flex items-center justify-center min-h-[380px] lg:min-h-[420px]">
            {cards.map((card, idx) => {
              const offset = getCardOffset(idx);
              const isActive = offset === 0;
              const Icon = card.icon;

              // Scale pattern:
              // offset 0 (Center - Pos 3): scale 1.0, zIndex 30, opacity 1.0
              // offset ±1 (Pos 2): scale 0.82, zIndex 20, opacity 0.8
              // offset ±2 (Pos 1): scale 0.66, zIndex 10, opacity 0.5
              let scale = 1.0;
              let opacity = 1.0;
              let zIndex = 30;

              if (Math.abs(offset) === 1) {
                scale = 0.83;
                opacity = 0.8;
                zIndex = 20;
              } else if (Math.abs(offset) === 2) {
                scale = 0.66;
                opacity = 0.5;
                zIndex = 10;
              } else if (Math.abs(offset) > 2) {
                scale = 0.5;
                opacity = 0;
                zIndex = 0;
              }

              // Horizontal offset translation: spacing ~220px on desktop
              const xTranslate = offset * 215;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => handleSelectCard(idx)}
                  initial={false}
                  animate={{
                    x: xTranslate,
                    scale,
                    opacity,
                    zIndex,
                  }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 280, damping: 28 }
                  }
                  className="absolute w-[360px] lg:w-[420px] cursor-pointer"
                >
                  {/* Fixed Aspect Ratio 4:3 Card Container */}
                  <div
                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-900 border transition-all duration-300 ${
                      isActive
                        ? "border-blue-600 shadow-2xl ring-4 ring-blue-600/30"
                        : "border-slate-300/80 shadow-md"
                    }`}
                  >
                    {/* Floating Glassmorphism Title Pill */}
                    <div className="absolute top-3 left-3 z-30 px-3.5 py-1.5 bg-white/85 backdrop-blur-md border border-white/30 shadow-sm rounded-full flex items-center gap-2 text-navy-900 text-xs font-extrabold pointer-events-none">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span>{t(card.titleKey.id, card.titleKey.en)}</span>
                    </div>

                    {card.videoSrc ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[idx] = el;
                        }}
                        src={card.videoSrc}
                        poster={card.posterSrc}
                        muted
                        playsInline
                        loop
                        preload={isActive ? "auto" : "none"}
                        onEnded={handleNext}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShowcaseVisualMockup type={card.type} isActive={isActive} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sole UI Control: Bottom Dots Indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {cards.map((card, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={card.id}
              onClick={() => handleSelectCard(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "w-7 bg-blue-600 shadow-sm"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Switch to showcase ${idx + 1}: ${t(card.titleKey.id, card.titleKey.en)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

{/* Fixed 4:3 Visual Mockup Component per Feature Card */}
function ShowcaseVisualMockup({
  type,
  isActive,
}: {
  type: "github" | "cli" | "monitoring" | "checkout" | "snapshot";
  isActive: boolean;
}) {
  if (type === "github") {
    return (
      <div className="p-5 w-full h-full font-mono text-xs text-green-400 flex flex-col justify-between bg-navy-900 select-none">
        <div className="flex items-center justify-between text-neutral-400 border-b border-navy-800 pb-2.5 pt-6 text-[11px]">
          <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
            <GitCommit className="w-3.5 h-3.5" /> branch: main (commit 9d4f21)
          </span>
          <span className="text-[10px] bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded-full">
            Pipeline Active
          </span>
        </div>
        <div className="space-y-2 text-xs text-neutral-300">
          <p className="text-neutral-400">&gt; git commit -m "feat: deploy server"</p>
          <p className="text-blue-300 font-bold">&gt; git push origin main</p>
          <p className="text-green-400 font-semibold flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Container LXD ready in 2.8s
          </p>
          <p className="text-neutral-400 truncate text-[11px]">URL: https://vps-42.rupacloud.id</p>
        </div>
        <div className="w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full bg-green-400 transition-all duration-700 ${
              isActive ? "w-full" : "w-1/3"
            }`}
          />
        </div>
      </div>
    );
  }

  if (type === "cli") {
    return (
      <div className="p-5 w-full h-full font-mono text-xs text-green-400 flex flex-col justify-between bg-navy-900 select-none">
        <div className="flex items-center justify-between text-neutral-400 border-b border-navy-800 pb-2.5 pt-6 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="ml-1 text-white font-bold">web-cli@node42</span>
          </span>
          <span className="text-neutral-400 text-[10px]">Restricted Shell v2.0</span>
        </div>
        <div className="space-y-1.5 text-xs text-neutral-300">
          <p className="text-neutral-400">root@node42:~# uname -a</p>
          <p className="text-neutral-300">Linux container-lxd 6.1.0-18-amd64 x86_64</p>
          <p className="text-neutral-400">root@node42:~# systemctl status nginx</p>
          <p className="text-green-400 font-bold">● nginx.service - Active (running)</p>
        </div>
        <div className="flex items-center gap-1.5 text-white text-xs pt-2">
          <span>root@node42:~#</span>
          <span className="w-2 h-4 bg-green-400 animate-pulse inline-block" />
        </div>
      </div>
    );
  }

  if (type === "monitoring") {
    return (
      <div className="p-5 w-full h-full font-sans text-white flex flex-col justify-between bg-navy-900 select-none">
        <div className="flex items-center justify-between text-neutral-400 text-xs border-b border-navy-800 pb-2 pt-6">
          <span className="flex items-center gap-1.5 text-blue-400 font-bold">
            <Activity className="w-4 h-4" /> Real-time Telemetry
          </span>
          <span className="text-green-400 text-[10px] font-semibold bg-green-500/20 px-2 py-0.5 rounded-full">
            Healthy
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-navy-800/80 rounded-xl border border-navy-700 space-y-1">
            <span className="text-neutral-400 block text-[10px]">CPU Allowance</span>
            <span className="text-base font-extrabold text-blue-400">18.4%</span>
            <div className="w-full bg-navy-900 rounded-full h-1.5">
              <div className="bg-blue-400 h-1.5 rounded-full w-1/5" />
            </div>
          </div>
          <div className="p-2.5 bg-navy-800/80 rounded-lg border border-navy-700 space-y-1">
            <span className="text-neutral-400 block text-[10px]">RAM Usage</span>
            <span className="text-base font-extrabold text-green-400">256 / 1024 MB</span>
            <div className="w-full bg-navy-900 rounded-full h-1.5">
              <div className="bg-green-400 h-1.5 rounded-full w-1/4" />
            </div>
          </div>
        </div>
        <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
          <span>Uptime: 99.98%</span>
          <span className="text-blue-300 font-semibold">Node ID-WEST-01</span>
        </div>
      </div>
    );
  }

  if (type === "checkout") {
    return (
      <div className="p-5 w-full h-full font-sans text-navy-900 flex flex-col justify-between bg-white border border-slate-200 select-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 pt-6">
          <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" /> Closed-Loop Wallet
          </span>
          <span className="text-sm font-extrabold text-blue-600">Rp50.000</span>
        </div>
        <div className="p-3 bg-blue-100/40 rounded-xl border border-blue-100 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-navy-900">Starter Node (+1 Hari)</span>
            <span className="font-extrabold text-navy-900">Rp3.500</span>
          </div>
          <div className="text-[10px] text-neutral-500">
            Bayar seketika tanpa OTP / payment gateway
          </div>
        </div>
        <div className="w-full py-2 bg-navy-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md">
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Konfirmasi Perpanjangan</span>
        </div>
      </div>
    );
  }

  // Type: Snapshot & Backup Instant
  return (
    <div className="p-5 w-full h-full font-sans text-white flex flex-col justify-between bg-navy-900 select-none">
      <div className="flex items-center justify-between text-neutral-400 text-xs border-b border-navy-800 pb-2 pt-6">
        <span className="flex items-center gap-1.5 text-blue-400 font-bold">
          <Camera className="w-4 h-4" /> LXD Image Snapshot
        </span>
        <span className="text-blue-300 text-[10px] font-semibold bg-blue-500/20 px-2 py-0.5 rounded-full">
          Instant Restore
        </span>
      </div>
      <div className="p-3 bg-navy-800/90 rounded-xl border border-navy-700 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-green-400" /> snap-2026-09-26.img
          </span>
          <span className="text-[10px] text-neutral-400">1.2 GB</span>
        </div>
        <div className="flex items-center gap-2 pt-1 text-[11px] text-green-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Status: Point-in-time state ready</span>
        </div>
      </div>
      <div className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md">
        <span>Restore Snapshot</span>
      </div>
    </div>
  );
}
