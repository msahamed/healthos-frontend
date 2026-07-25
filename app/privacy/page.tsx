import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Ontor",
  description: "Ontor privacy policy. Your voice is analyzed on your device; nothing is uploaded unless you turn on optional sync.",
};

const TEAL = "#0F766E";
const TEAL_LIGHT = "#F0FDFA";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Header */}
        <section className="py-14 md:py-20" style={{ backgroundColor: TEAL_LIGHT }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: TEAL, color: "white" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-slate-500">Last updated: July 24, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-10 not-prose">
              <p className="text-sm font-semibold text-emerald-800 mb-1">Our core commitment</p>
              <p className="text-sm text-emerald-700">
                Ontor analyzes your voice on your device. By default, nothing is uploaded: your
                voice and results stay on your device unless you choose to turn on optional sync.
              </p>
            </div>

            <h2>1. Information We Process</h2>
            <ul>
              <li><strong>Your voice</strong> — short audio captured while you record a check-in or run a session, analyzed on your device to estimate your nervous-system state.</li>
              <li><strong>Only you</strong> — Ontor is speaker-gated. It analyzes your voice only. When someone else is speaking, Ontor does not record or analyze them.</li>
              <li><strong>Your results</strong> — the signals Ontor derives (for example energy, stress, confidence, fatigue) and your personal history, used to compare each reading against your own baseline.</li>
            </ul>

            <h2>2. On-Device Analysis</h2>
            <p>
              The voice analysis runs entirely on your device using an on-device model. By default,
              your audio and results are not sent to Ontor&apos;s servers or any third party.
            </p>

            <h2>3. Optional Sync</h2>
            <p>
              If you choose to turn on sync, some of your data (such as your results and history) is
              sent to and stored on Ontor&apos;s servers so it can be available across your devices.
              Sync is off by default and only happens if you enable it. You can turn it off at any
              time. Raw audio is not part of sync.
            </p>

            <h2>4. Data Storage</h2>
            <p>
              Data on your device is kept in Ontor&apos;s private storage. If you enable sync, the
              synced portion of your data is stored on Ontor&apos;s servers. iCloud or Google
              backup, if any, is controlled by your own device settings.
            </p>

            <h2>5. Analytics and Tracking</h2>
            <p>
              Ontor does not use advertising identifiers or third-party advertising SDKs, and does
              not sell your data.
            </p>

            <h2>6. Microphone</h2>
            <p>
              Ontor requests microphone access solely to capture your voice for analysis during a
              check-in or session.
            </p>

            <h2>7. Children&apos;s Privacy</h2>
            <p>
              Ontor is not directed at children under 13. We do not knowingly collect personal
              information from children.
            </p>

            <h2>8. Your Rights</h2>
            <ul>
              <li><strong>Delete</strong> — delete your data from within Ontor; if you use sync, your synced data can be deleted too.</li>
              <li><strong>Turn off sync</strong> — stop syncing at any time in settings.</li>
            </ul>
            <p>
              Uninstalling Ontor removes the data stored on that device.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy as features change. Material changes will be posted here with
              a new &quot;Last updated&quot; date.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:sabber@ontor.ai" style={{ color: TEAL }}>sabber@ontor.ai</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-medium text-slate-700">Ontor</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Use</Link>
            <a href="mailto:sabber@ontor.ai" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Ontor</p>
        </div>
      </footer>
    </>
  );
}
