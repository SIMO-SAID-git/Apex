"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface KineticHeadingProps {
  text: string;
  className?: string;
  as?: "h1" | "h2";
}

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** Staggers each word in on load. Falls back to a static heading for prefers-reduced-motion. */
export function KineticHeading({ text, className, as = "h1" }: KineticHeadingProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const words = text.split(" ");
  const Tag = as;

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="mr-[0.28em] inline-block whitespace-nowrap"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
