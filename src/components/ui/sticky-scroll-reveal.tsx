"use client";

import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollRevealItem } from "@/components/ui/scroll-reveal";

export interface StickyScrollRevealItem {
  id: string;
  letter: string;
  title: string;
  description: string;
}

interface StickyScrollRevealProps {
  content: StickyScrollRevealItem[];
  title?: React.ReactNode;
}

export const StickyScrollReveal = ({ content, title }: StickyScrollRevealProps) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within the 500vh container
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const cardLength = content.length;

  // Determine active card for the left panel letters
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const activeIndex = Math.round(latest * (cardLength - 1));
    setActiveCard(Math.min(Math.max(activeIndex, 0), cardLength - 1));
  });

  return (
    <div className="w-full relative">
      {/* Desktop Layout (Pinned Scroll) */}
      <div
        ref={ref}
        className="hidden lg:block relative w-full"
        style={{ height: `${cardLength * 100}vh` }} // e.g., 500vh for 5 cards
      >
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
          
          {/* Optional Title rendered inside the pinned section */}
          {title && (
            <div className="absolute top-12 lg:top-20 w-full z-10 px-4">
              <ScrollRevealItem delay={0} direction="up" distance={25}>
                {title}
              </ScrollRevealItem>
            </div>
          )}

          <div className="flex w-full max-w-7xl mx-auto px-8 relative h-full items-center pt-24">
            
            {/* Left Panel: Sticky Letter (50% width) */}
            <div className="w-[40%] flex flex-col items-center justify-center relative h-full">
              {/* Indicator "CLOUD" at the top center of the left panel */}
              <div className="absolute top-[25%] flex space-x-3 select-none">
                {content.map((item, idx) => (
                  <span
                    key={item.id}
                    className={cn(
                      "text-2xl font-bold transition-colors",
                      prefersReducedMotion ? "duration-0" : "duration-300",
                      activeCard === idx
                        ? "text-blue-600"
                        : "text-navy-900/20"
                    )}
                  >
                    {item.letter}
                  </span>
                ))}
              </div>

              {/* Giant Letter Container */}
              <div className="h-64 flex items-center justify-center relative w-64 overflow-hidden select-none">
                {content.map((item, idx) => (
                  <div
                    key={item.id}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center text-[18rem] font-extrabold text-navy-900 transition-all",
                      prefersReducedMotion ? "duration-0" : "duration-500",
                      activeCard === idx
                        ? "opacity-100 translate-y-0 scale-100"
                        : activeCard > idx
                        ? "opacity-0 -translate-y-16 scale-90"
                        : "opacity-0 translate-y-16 scale-90"
                    )}
                  >
                    {item.letter}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Curved Scrollable Content (60% width) */}
            <div className="w-[60%] h-full relative flex items-center justify-start [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
              {content.map((item, index) => {
                // We map scrollYProgress (0 to 1) to each card's visual transforms.
                // Distance: how far this card's index is from the current scroll "center"
                const distanceFn = (v: number) => index - v * (cardLength - 1);
                
                const y = useTransform(scrollYProgress, (v) => distanceFn(v) * 200);
                
                // Curve X: peaks at distance=0, curves left (smaller X) as distance increases.
                // We want the active card pushed right (e.g., translateX 100px),
                // others pulled left (e.g., 0px or negative).
                const x = useTransform(scrollYProgress, (v) => {
                  const dist = Math.abs(distanceFn(v));
                  return Math.max(0, 120 - Math.pow(dist, 1.5) * 50);
                });
                
                const opacity = useTransform(scrollYProgress, (v) => {
                  if (prefersReducedMotion) return index === activeCard ? 1 : 0.4;
                  const dist = Math.abs(distanceFn(v));
                  return Math.max(0, 1 - dist * 0.45);
                });
                
                const scale = useTransform(scrollYProgress, (v) => {
                  if (prefersReducedMotion) return index === activeCard ? 1 : 0.95;
                  const dist = Math.abs(distanceFn(v));
                  return Math.max(0.85, 1 - dist * 0.05);
                });

                return (
                  <motion.div
                    key={item.id}
                    style={{ y, x, opacity, scale }}
                    className="absolute w-full max-w-md p-8 bg-white border border-blue-400/20 rounded-lg shadow-sm flex flex-col justify-center"
                  >
                    <h3 className="text-2xl font-bold text-navy-900 mb-3 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-base text-navy-800 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Layout (Non-sticky, Stacked) */}
      <div className="lg:hidden flex flex-col space-y-6 px-4 py-16">
        {title && (
          <ScrollRevealItem delay={0} direction="up" distance={25}>
            <div className="mb-8">{title}</div>
          </ScrollRevealItem>
        )}
        {content.map((item, index) => (
          <ScrollRevealItem key={item.id} delay={index * 0.1}>
            <div className="p-6 bg-white border border-blue-400/20 rounded-lg shadow-sm">
              <h3 className="flex items-center gap-3 text-xl font-bold text-navy-900 mb-3 tracking-tight">
                <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-md text-sm font-extrabold">
                  {item.letter}
                </span>
                {item.title}
              </h3>
              <p className="text-sm text-navy-800 leading-relaxed">
                {item.description}
              </p>
            </div>
          </ScrollRevealItem>
        ))}
      </div>
    </div>
  );
};
