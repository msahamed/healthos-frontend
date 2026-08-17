import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Ontor",
  description: "Ontor privacy policy. Your voice is analyzed on your device; your recordings and results are uploaded only if you turn on optional sync.",
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
            <p className="text-slate-500">Last updated: August 17, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-10 not-prose">
              <p className="text-sm font-semibold text-emerald-800 mb-1">Our core commitment</p>
              <p className="text-sm text-emerald-700">
                Ontor analyzes your voice on your device. Your recordings and results stay on your
                device unless you turn on optional sync, which is off by default. Ontor is not a
                medical device and does not diagnose or treat any condition.
              </p>
            </div>

            <h2>1. Information We Process</h2>
            <ul>
              <li><strong>Your voice</strong> — short audio captured while you record a check-in or run a session, analyzed on your device to estimate your nervous-system state.</li>
              <li><strong>Only you</strong> — Ontor is speaker-gated. It analyzes your voice only. When someone else is speaking, Ontor does not record or analyze them.</li>
              <li><strong>Your results</strong> — the signals Ontor derives (for example energy, stress, confidence, fatigue) and your personal history, used to compare each reading against your own baseline.</li>
              <li><strong>Your email address</strong> — if you provide one during setup, used to identify your account, send you a sign-in code, and restore your history on a new device.</li>
              <li><strong>App usage and reliability data</strong> — see section 5.</li>
            </ul>

            <h2>2. On-Device Analysis</h2>
            <p>
              The voice analysis runs entirely on your device using an on-device model. By default,
              your audio and results are not sent to Ontor&apos;s servers or any third party.
            </p>

            <h2>3. Optional Sync</h2>
            <p>
              Sync is off by default. If you turn it on in Settings, your results and history
              <strong> and the voice recordings from your check-ins</strong> are uploaded to and
              stored on Ontor&apos;s servers, so your history can be restored on another device.
              You can turn sync off at any time; while it is off, nothing from your check-ins is
              uploaded.
            </p>

            <h2>4. Data Storage</h2>
            <p>
              Data on your device is kept in Ontor&apos;s private storage. If you enable sync, the
              synced portion of your data is stored on Ontor&apos;s servers. iCloud or Google
              backup, if any, is controlled by your own device settings.
            </p>

            <h2>5. Analytics and Tracking</h2>
            <p>
              Ontor sends usage and reliability data (such as which screens you open, when a
              check-in completes, and crash reports) to Ontor&apos;s own servers, tied to a
              randomly generated device identifier. This is independent of sync and happens
              whether or not sync is on. This identifier is not linked to your name, and we do not
              combine it with data from other companies. To request that we stop collecting usage
              data from your device, or delete what we already hold, email us at the address in
              section 10.
            </p>
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
              <li><strong>Delete any check-in</strong> — delete an individual check-in directly in Ontor. It is removed from your device, and if sync is on, the recording, transcript, and derived signals for that check-in are cleared from your synced history too.</li>
              <li><strong>Turn off sync</strong> — stop syncing at any time in Settings. Nothing further is uploaded from that point.</li>
              <li><strong>Delete local data</strong> — uninstalling Ontor removes everything stored on that device.</li>
              <li><strong>Delete your account entirely</strong> — email us at the address in section 10 and we will delete your account and everything we hold for it, including any backed-up recordings.</li>
              <li><strong>Access</strong> — request a copy of the data we hold for your account by emailing the same address.</li>
            </ul>

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
