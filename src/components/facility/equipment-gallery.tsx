"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function EquipmentGallery({ images, zoneName }: { images: string[]; zoneName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5">
        <Image
          src={images[activeIndex] ?? images[0]!}
          alt={`${zoneName} equipment photo ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 420px"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1} of ${zoneName}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
