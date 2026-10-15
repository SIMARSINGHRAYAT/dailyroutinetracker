import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Daily Routine Tracker",
  description:
    "Privacy Policy for Daily Routine Tracker. Learn how we handle, store, and protect your habits, routines, and personal data.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <main className="glossy-grid-bg relative min-h-screen overflow-hidden py-12 px-4 sm:px-6 md:px-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-10 left-[20%] h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-20 right-[18%] h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="mb-8 border-b border-white/10 pb-6">
          <span className="inline-block rounded-full border border-cyan-400/40 bg-cyan-950/30 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            Legal & Compliance
          </span>
          <h1 className="mt-3 bg-gradient-to-r from-fuchsia-300 via-sky-300 to-emerald-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <article className="space-y-6 text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">1. Introduction</h2>
            <p className="text-sm sm:text-base">
              Welcome to <strong className="text-slate-100">Daily Routine Tracker</strong>. We respect your privacy and are committed to transparently protecting your personal and routine tracking data. This Privacy Policy outlines what information is collected, how it is used, and how your privacy is safeguarded when using our web application or associated extensions.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">2. Information We Collect</h2>
            <p className="text-sm sm:text-base">
              Daily Routine Tracker is designed with a privacy-first mindset. We collect only the minimal data required to provide daily routine tracking and consistency analytics:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-300">
              <li>
                <strong className="text-slate-200">Routine & Task Data:</strong> Tracker names, duration in days, task descriptions, start dates, and daily task completion states.
              </li>
              <li>
                <strong className="text-slate-200">User Preferences:</strong> Visual settings (such as accessibility zoom/page scale) and custom reminder times stored locally in your browser.
              </li>
              <li>
                <strong className="text-slate-200">No Sensitive Personal Data:</strong> We do not ask for or collect passwords, government IDs, physical addresses, or financial payment details.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">3. How Your Data Is Used</h2>
            <p className="text-sm sm:text-base">
              Your routine and habit data is used solely to deliver the features of the application:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-300">
              <li>Displaying your interactive habit grid and daily activity logs.</li>
              <li>Calculating your consistency scores, completion percentages, and winning streaks.</li>
              <li>Triggering local browser notifications at your configured reminder intervals (when enabled).</li>
              <li>Exporting your routines and progress reports into printable PDF documents upon request.</li>
              <li>
                <strong className="text-emerald-400">We never sell, rent, monetize, or trade your data</strong> to third parties, advertisers, or data brokers.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">4. Data Storage and Security</h2>
            <p className="text-sm sm:text-base">
              All communications between your browser and our servers are encrypted in transit using industry-standard SSL/TLS (HTTPS). Backend data is safely persisted in an encrypted PostgreSQL database. Local preferences and notification sent markers are stored securely in your browser&apos;s isolated LocalStorage.
            </p>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">5. Browser Notifications & Extension Integration</h2>
            <p className="text-sm sm:text-base">
              When using browser extensions or desktop alerts, notification permissions are utilized exclusively to deliver routine reminders at the times you schedule. Notification permissions can be modified or revoked at any time through your browser settings.
            </p>
          </section>

          {/* Section 6 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">6. Data Ownership and Deletion Rights</h2>
            <p className="text-sm sm:text-base">
              You maintain complete control and ownership over your data at all times. Within the application, you can:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-300">
              <li>Edit, add, or remove individual tasks from any routine.</li>
              <li>Clear completed activity checks across specific days or the entire tracker.</li>
              <li>Permanently delete any tracker and its entire associated history.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">7. Changes to This Policy</h2>
            <p className="text-sm sm:text-base">
              We may update this Privacy Policy from time to time to reflect operational or legal updates. Any revisions will be published directly on this page with an updated &ldquo;Last Updated&rdquo; date.
            </p>
          </section>

          {/* Section 8 */}
          <section className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-slate-100">8. Contact Information</h2>
            <p className="text-sm sm:text-base">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact the maintainer via the official project repository.
            </p>
          </section>
        </article>

        <footer className="mt-12 text-center text-xs text-slate-500 border-t border-white/10 pt-6">
          &copy; {new Date().getFullYear()} Daily Routine Tracker. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
