import { CheckCircle2 } from "lucide-react";

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-blue-500 to-violet-500 shadow-[0_0_30px_rgba(59,130,246,0.45)]">
        <CheckCircle2 className="h-5 w-5 text-white" />
      </div>
      {!compact && (
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Productivity Suite</p>
          <p className="text-sm font-semibold">YOUR DAILY ROUTINE</p>
        </div>
      )}
    </div>
  );
}
