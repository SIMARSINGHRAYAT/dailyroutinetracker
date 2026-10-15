import { TopNav } from "@/components/top-nav";
import { SettingsClient } from "@/components/views/settings-client";

export default function SettingsPage() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <SettingsClient />
    </main>
  );
}
