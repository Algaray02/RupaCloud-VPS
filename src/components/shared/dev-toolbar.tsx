"use client";

import React, { useState, useEffect } from "react";
import { Role } from "@/lib/data/types";
import { UserCheck, ShieldAlert, UserX, GripHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function DevToolbar() {
  const [role, setRole] = useState<Role>("GUEST");
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Read current role from cookie or localStorage
    const savedRole = (document.cookie
      .split("; ")
      .find((row) => row.startsWith("rc_mock_role="))
      ?.split("=")[1] as Role) || "GUEST";
    setRole(savedRole);
  }, []);

  const [isChanging, setIsChanging] = useState(false);

  const handleRoleChange = async (newRole: Role) => {
    setIsChanging(true);
    try {
      if (newRole === "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" });
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@rupacloud.id",
            password: "Admin123!",
          }),
        });
        document.cookie = "rc_mock_role=ADMIN; path=/; max-age=86400";
        window.location.href = "/admin/dashboard";
      } else if (newRole === "CUSTOMER") {
        await fetch("/api/auth/logout", { method: "POST" });
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "budi@student.univ.ac.id",
            password: "Password123!",
          }),
        });
        document.cookie = "rc_mock_role=CUSTOMER; path=/; max-age=86400";
        window.location.href = "/dashboard";
      } else {
        await fetch("/api/auth/logout", { method: "POST" });
        document.cookie = "rc_mock_role=GUEST; path=/; max-age=0";
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Failed to switch role:", err);
      setIsChanging(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 240, e.clientX - dragOffset.x)),
        y: Math.max(10, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
      className="fixed z-50 bg-navy-900 text-white rounded-xl shadow-2xl border border-navy-800 p-2.5 w-64 select-none backdrop-blur-md bg-opacity-95 text-xs font-sans print:hidden"
    >
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-2 border-b border-navy-800 cursor-grab active:cursor-grabbing mb-2"
      >
        <div className="flex items-center gap-1.5 font-bold text-blue-400">
          <GripHorizontal className="w-4 h-4 text-blue-400/70" />
          <span>Dev Toolbar (Role Switcher)</span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-neutral-400 hover:text-white p-0.5 rounded"
        >
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-2">
          <div className="text-[11px] text-neutral-400">Aktifkan role untuk demo:</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleRoleChange("GUEST")}
              disabled={isChanging}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1 cursor-pointer disabled:opacity-50",
                role === "GUEST"
                  ? "bg-blue-600 border-blue-400 text-white font-bold"
                  : "bg-navy-800/60 border-navy-800 text-neutral-300 hover:bg-navy-800"
              )}
            >
              <UserX className="w-4 h-4" />
              <span>Guest</span>
            </button>

            <button
              onClick={() => handleRoleChange("CUSTOMER")}
              disabled={isChanging}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1 cursor-pointer disabled:opacity-50",
                role === "CUSTOMER"
                  ? "bg-blue-600 border-blue-400 text-white font-bold"
                  : "bg-navy-800/60 border-navy-800 text-neutral-300 hover:bg-navy-800"
              )}
            >
              <UserCheck className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => handleRoleChange("ADMIN")}
              disabled={isChanging}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1 cursor-pointer disabled:opacity-50",
                role === "ADMIN"
                  ? "bg-blue-600 border-blue-400 text-white font-bold"
                  : "bg-navy-800/60 border-navy-800 text-neutral-300 hover:bg-navy-800"
              )}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
          <div className="text-[10px] text-neutral-400 text-center pt-1 border-t border-navy-800">
            Cookie: <code className="text-blue-300">rc_mock_role={role}</code>
          </div>
        </div>
      )}
    </div>
  );
}
