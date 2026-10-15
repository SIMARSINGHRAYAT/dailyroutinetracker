"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const quotes = [
  {
    text: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.",
    author: "David Goggins",
  },
  {
    text: "Hard work beats talent when talent doesn’t work hard.",
    author: "Tim Notke",
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King",
  },
  {
    text: "If you fail to prepare, you’re prepared to fail.",
    author: "Mark Spitz",
  },
];

export default function WelcomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 top-[8%] h-56 w-56 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute left-[24%] top-[12%] h-56 w-56 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute right-[8%] top-[12%] h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="absolute left-[10%] bottom-[12%] h-56 w-56 rounded-full bg-green-500/25 blur-3xl" />
        <div className="absolute right-[24%] bottom-[10%] h-56 w-56 rounded-full bg-yellow-400/25 blur-3xl" />
        <div className="absolute right-[6%] bottom-[22%] h-56 w-56 rounded-full bg-red-500/25 blur-3xl" />
        <div className="absolute left-1/2 bottom-[3%] h-56 w-56 -translate-x-1/2 rounded-full bg-orange-500/25 blur-3xl" />
      </div>

      <section className="relative w-full max-w-5xl space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="bg-gradient-to-r from-fuchsia-300 via-sky-300 via-emerald-300 to-yellow-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl"
        >
          DAILY ROUTINE TRACKER
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 bg-clip-text text-base text-transparent md:text-2xl"
        >
          Discipline • Consistency • Growth
        </motion.p>

        <div className="mx-auto mt-8 min-h-[84px] max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <p className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-sm italic text-transparent md:text-lg">
                “{quotes[index].text}”
              </p>
              <p className="mt-1 bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-xs text-transparent md:text-sm">
                — {quotes[index].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="pt-1"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-2xl border border-white/30 bg-transparent px-8 py-3 text-lg text-slate-100 transition hover:scale-[1.03]"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
