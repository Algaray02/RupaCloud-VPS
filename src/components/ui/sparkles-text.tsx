"use client";

import React from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface SparklesTextProps {
  text: string;
  className?: string;
}

export function SparklesText({ text, className = "" }: SparklesTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative inline-flex items-center justify-center gap-1 ${className}`}>
      <svg
        className="w-3 h-3 text-yellow-300 animate-pulse"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span>{text}</span>
      <svg
        className="w-3 h-3 text-yellow-300 animate-pulse delay-300"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    </span>
  );
}
