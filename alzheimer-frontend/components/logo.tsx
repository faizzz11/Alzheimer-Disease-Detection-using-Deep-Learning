"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Brain } from "lucide-react";

export const LogoIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center bg-gradient-to-br from-[#FFA756] to-[#EE602C] p-2 rounded-xl shadow-lg", className)}>
    <Brain className="w-5 h-5 text-white" />
  </div>
);

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/"
      className={cn(
        "font-normal flex gap-3 justify-center items-center text-sm px-2 py-1 shrink-0 relative z-20 transition-transform hover:scale-[1.02]",
        className
      )}
    >
      <LogoIcon />
      <span className="font-semibold text-gray-900 text-xl tracking-tight">NeuroScan AI</span>
    </Link>
  );
};
