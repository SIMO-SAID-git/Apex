import Image from "next/image";
import { initialsFromName } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export function InstructorAvatar({
  name,
  avatarUrl,
  size = 32,
  className,
}: {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}) {
  if (!avatarUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          "flex items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white/80",
          className
        )}
        aria-hidden
      >
        {initialsFromName(name)}
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt=""
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
