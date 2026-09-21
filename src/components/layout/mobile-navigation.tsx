"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { buttonVariants } from "@/components/ui/button";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { signOut } = useAuthActions();

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="p-2 -mr-2 text-white/80 hover:text-white"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-surface-950/98 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
              <span className="font-display text-lg tracking-tight">{siteConfig.name}</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-2 text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1" aria-label="Mobile">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-4 text-lg text-white/90 hover:bg-white/5 min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-white/10" aria-hidden />
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="rounded-xl px-4 py-4 text-lg text-status-peak hover:bg-status-peak/10 min-h-[44px] flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </button>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className={buttonVariants({ variant: "primary", className: "w-full" })}
                  >
                    Join now
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
