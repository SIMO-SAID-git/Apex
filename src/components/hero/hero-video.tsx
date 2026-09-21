"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface HeroVideoProps {
  sources: { src: string; type: string }[];
  posterUrl: string;
  className?: string;
}

/**
 * Autoplaying background video with a clean fallback path: if the browser
 * blocks autoplay or the video fails to load, the poster image remains
 * visible instead of a broken/blank element. Kept isolated from HeroSection
 * so an HLS.js-backed player can be swapped in later without touching layout.
 */
export function HeroVideo({ sources, posterUrl, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const showVideo = !hasFailed && !prefersReducedMotion;

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-surface-950", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          showVideo ? "opacity-0" : "opacity-100"
        )}
      />
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          onError={() => setHasFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-surface-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-950/40 via-transparent to-surface-950/40" />
    </div>
  );
}
