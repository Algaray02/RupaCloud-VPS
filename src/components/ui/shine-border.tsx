"use client";

import React from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string[];
  borderWidth?: number;
  duration?: number;
}

export function ShineBorder({
  children,
  className = "",
  color = ["#052659", "#5483B3", "#7DA0CA"], // navy-800, blue-600, blue-400 tokens
  borderWidth = 2,
  duration = 8,
}: ShineBorderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`relative rounded-2xl border-2 border-blue-600 shadow-lg ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl p-[2px] overflow-hidden ${className}`}
      style={{
        background: `conic-gradient(from 0deg, ${color.join(", ")}, ${color[0]})`,
      }}
    >
      <div
        className="absolute inset-0 animate-spin-slow"
        style={{
          background: `conic-gradient(from 0deg, ${color.join(", ")}, ${color[0]})`,
          animationDuration: `${duration}s`,
        }}
      />
      <div className="relative rounded-[14px] bg-white h-full w-full z-10">
        {children}
      </div>
    </div>
  );
}
