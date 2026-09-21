"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { fadeUp } from "@/lib/animation/variants";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,255,107,0.08),_transparent_60%)]"
      />
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative w-full max-w-md">
        <GlassCard strong className="p-8 sm:p-10 elevated">
          {children}
        </GlassCard>
      </motion.div>
    </div>
  );
}
