"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { LiveOccupancyWidget } from "@/components/hero/live-occupancy-widget";
import { AccountMenu } from "@/components/account/account-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@/hooks/auth/use-auth";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        isScrolled ? "bg-surface-950/80 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      )}
    >
      <ScrollProgress />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight text-white">
          {siteConfig.name}
        </Link>

        <nav className="hidden sm:flex items-center gap-1" aria-label="Primary">
          {siteConfig.nav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LiveOccupancyWidget compact />
          </div>
          {!isLoading ? (
            isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <NotificationBell />
                <AccountMenu />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Sign in
                </Link>
                <Link href="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>
                  Join now
                </Link>
              </div>
            )
          ) : null}
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
