import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TrackerProvider } from "@/components/tracker-provider";

export const metadata: Metadata = {
  title: "DAILY ROUTINE TRACKER",
  description:
    "Daily productivity, habit tracking, performance analytics, reminders, and exports.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased transition-colors">
        <ThemeProvider>
          <TrackerProvider>{children}</TrackerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
