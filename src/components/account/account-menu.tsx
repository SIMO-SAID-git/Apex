"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, CalendarDays, Dumbbell, Settings, LogOut, User, ListChecks, History } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { initialsFromName } from "@/lib/utils/formatters";

const MEMBER_MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { href: "/dashboard/workout-plan", label: "Workout Plan", icon: Dumbbell },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
];

// Trainers manage classes rather than booking them — see lib/auth/permissions.ts.
const TRAINER_MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/classes", label: "My Classes", icon: ListChecks },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
];

export function AccountMenu() {
  const { profile, user } = useAuth();
  const { signOut } = useAuthActions();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.displayName || user?.email?.split("@")[0] || "Account";
  const menuItems = profile?.role === "trainer" ? TRAINER_MENU_ITEMS : MEMBER_MENU_ITEMS;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-white/5 transition-colors"
      >
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-medium">
            {initialsFromName(displayName)}
          </span>
        )}
        <span className="text-sm text-white/80 hidden sm:inline">{displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-2 elevated z-50"
          >
            {profile ? (
              <Link
                href={`/profile/${profile.username}`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <User className="h-4 w-4 text-white/40" />
                View public profile
              </Link>
            ) : null}
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4 text-white/40" />
                {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-white/10" aria-hidden />
            <button
              role="menuitem"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-status-peak hover:bg-status-peak/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
