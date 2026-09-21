import Link from "next/link";
import { siteConfig } from "@/config/site";

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <Link href="/" className="font-display text-lg tracking-tight text-white/70 hover:text-white transition-colors">
        {siteConfig.name}
      </Link>
      <h1 className="mt-4 text-2xl font-display font-medium text-white">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-white/60">{subtitle}</p> : null}
    </div>
  );
}
