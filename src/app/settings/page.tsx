import { TopNav } from "@/components/top-nav";
import { SettingsClient } from "@/components/views/settings-client";

export default function SettingsPage() {
  return (
    <main className="glossy-grid-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="absolute bottom-10 left-[20%] h-80 w-80 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="absolute bottom-20 right-[18%] h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
      </div>

      <div className="relative z-10">
        <TopNav />
        <SettingsClient />
      </div>
    </main>
  );
}
