"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export function TopNav() {
  return (
    <div className="fixed right-4 top-4 z-40 md:right-8 md:top-6">
      <Link
        href="/settings"
        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/40 p-2.5 text-slate-200 backdrop-blur-md transition hover:scale-105 hover:border-white/40 hover:text-white"
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </div>
  );
}
