"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function SettingsClient() {
  useEffect(() => {
    // Revert and clear any custom page scaling
    document.documentElement.style.fontSize = "";
    localStorage.removeItem("drt-page-scale");
  }, []);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white mb-6"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="bg-gradient-to-r from-sky-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-3xl font-semibold text-transparent md:text-4xl">
        Settings
      </h1>
      <p className="mt-2 text-slate-300">Application and display preferences.</p>

      <div className="mt-6 rounded-2xl border border-white/20 bg-transparent p-6 backdrop-blur-sm space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Display & Page Scale</h2>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Page scale is locked to native 100% standard layout.</span>
        </div>
        <p className="text-xs text-slate-400">
          Root scaling is disabled to ensure responsive grid alignment across all screen sizes.
        </p>
      </div>
    </section>
  );
}
