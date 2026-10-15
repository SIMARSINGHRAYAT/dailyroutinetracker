"use client";

import Link from "next/link";
import { LayoutDashboard, Settings } from "lucide-react";

export function TopNav() {
  return (
    <div className="fixed right-4 top-4 z-40 flex items-center gap-2 md:right-8 md:top-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/50 p-2 text-slate-200 backdrop-blur-md transition hover:scale-105 hover:border-cyan-400/50 hover:text-cyan-200"
        aria-label="Dashboard"
        title="Dashboard"
      >
        <LayoutDashboard className="h-4.5 w-4.5" />
      </Link>
      <Link
        href="/settings"
        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/50 p-2 text-slate-200 backdrop-blur-md transition hover:scale-105 hover:border-cyan-400/50 hover:text-cyan-200"
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="h-4.5 w-4.5" />
      </Link>
    </div>
  );
}
