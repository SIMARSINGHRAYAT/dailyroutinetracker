"use client";

import { useEffect, useState } from "react";

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
      <h1 className="bg-gradient-to-r from-sky-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-3xl font-semibold text-transparent">
        Settings
      </h1>
      <p className="mt-1 text-slate-300">Adjust accessibility page size.</p>

      <div className="mt-5 rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-100">Page Size</h2>
        <p className="mt-1 text-sm text-slate-300">Current scale: {scale}%</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn-secondary border-white/20 bg-black/45"
            onClick={() => setScale((v) => Math.max(MIN_SCALE, v - STEP))}
          >
            Decrease
          </button>
          <button
            className="btn-secondary border-white/20 bg-black/45"
            onClick={() => setScale(100)}
          >
            Reset
          </button>
          <button
            className="btn-primary"
            onClick={() => setScale((v) => Math.min(MAX_SCALE, v + STEP))}
          >
            Increase
          </button>
        </div>
      </div>
    </section>
  );
}
