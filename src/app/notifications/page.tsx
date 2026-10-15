import { TopNav } from "@/components/top-nav";
import { NotificationsClient } from "@/components/views/notifications-client";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <NotificationsClient />
    </main>
  );
}
