"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

const MIN_SCALE = 80;
const MAX_SCALE = 140;
const STEP = 5;

export function SettingsClient() {
  const [scale, setScale] = useState(100);

  useEffect(() => {
    const saved = Number(localStorage.getItem("drt-page-scale") || "100");
    const valid = Number.isFinite(saved) ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, saved)) : 100;
    setScale(valid);
    document.documentElement.style.fontSize = `${valid}%`;
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${scale}%`;
    localStorage.setItem("drt-page-scale", String(scale));
  }, [scale]);

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
      <p className="mt-2 text-slate-300">Adjust accessibility page size and personal view settings.</p>

      <div className="mt-6 rounded-2xl border border-white/20 bg-transparent p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-100">Page Scaling</h2>
        <p className="mt-1 text-sm text-slate-300">
          Current scale: <span className="text-cyan-300 font-semibold">{scale}%</span>
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white hover:scale-[1.02]"
            onClick={() => setScale((v) => Math.max(MIN_SCALE, v - STEP))}
          >
            Decrease
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white hover:scale-[1.02]"
            onClick={() => setScale(100)}
          >
            Reset
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-300/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:scale-[1.02] hover:bg-cyan-500/10 hover:border-cyan-300"
            onClick={() => setScale((v) => Math.min(MAX_SCALE, v + STEP))}
          >
            Increase
          </button>
        </div>
      </div>
    </section>
  );
}
