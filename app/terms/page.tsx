import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Ontor",
  description: "Ontor terms of use. Read before using Ontor.",
};

const TEAL = "#0F766E";
const TEAL_LIGHT = "#F0FDFA";

export default function TermsPage() {
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
                <path d="M9 12h6M9 16h6M9 8h6M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms of Use</h1>
            <p className="text-slate-500">Last updated: July 24, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10 not-prose">
              <p className="text-sm font-semibold text-amber-800 mb-1">Not a medical device</p>
              <p className="text-sm text-amber-700">
                Ontor is a performance-insight tool, not a medical device or clinical tool.
                It does not provide medical advice, diagnosis, or treatment. Always consult a qualified
                professional for medical or mental-health decisions.
              </p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By downloading or using Ontor (&quot;the App&quot;), you agree to these Terms of Use.
              If you do not agree, do not use the App. These terms govern your use of the App
              and any related services provided by Ontor.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Ontor is a performance-insight product that reads your nervous-system state (for
              example energy, stress, and confidence) from your voice. It lets you:
            </p>
            <ul>
              <li>Record a short voice check-in, or run a live session on desktop</li>
              <li>See a read on your state, measured against your own recent baseline</li>
              <li>Optionally sync your results across your devices</li>
            </ul>

            <h2>3. Not Medical Advice</h2>
            <p>
              Ontor is a performance-insight tool, not a medical device. Its readings are for
              informational purposes only and do not constitute medical advice, diagnosis, or
              treatment. Always seek the advice of a qualified professional with any questions
              regarding a medical or mental-health condition.
            </p>

            <h2>4. Accuracy</h2>
            <p>
              Ontor&apos;s readings are estimates derived from your voice, and can be affected by
              background noise, recording conditions, and other factors. They may be incomplete or
              inaccurate, and should be treated as one signal among many, not a definitive
              measurement.
            </p>

            <h2>5. Your Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Use Ontor only for your own personal, non-commercial use</li>
              <li>Not use Ontor to record or analyze other people without their knowledge and consent</li>
              <li>Keep your device secure to protect your data</li>
              <li>Not attempt to reverse-engineer, decompile, or modify Ontor</li>
            </ul>

            <h2>6. Data Ownership</h2>
            <p>
              You retain ownership of your data. Ontor does not claim ownership of your voice or the
              results derived from it. By default your data stays on your device; if you enable sync,
              it is stored on Ontor&apos;s servers so it is available across your devices. See our
              Privacy Policy for details.
            </p>

            <h2>7. Disclaimer of Warranties</h2>
            <p>
              Ontor is provided &quot;as is&quot; without warranty of any kind. Ontor does not warrant
              that it will be error-free or that its readings will be accurate or complete. The
              readings are assistive and may make errors.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Ontor shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of Ontor, including
              reliance on its readings for any decision.
            </p>

            <h2>9. Intellectual Property</h2>
            <p>
              The Ontor app, including its design, code, and AI models (excluding open-source
              components), is the intellectual property of Ontor. You are granted a limited,
              non-exclusive, non-transferable license to use the App for personal purposes.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We may update these terms as the App evolves. Continued use of the App after
              changes are posted constitutes acceptance of the revised terms. We will notify
              users of material changes via an in-app notice.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms are governed by the laws of the United States. Any disputes shall
              be resolved in the applicable courts of the United States.
            </p>

            <h2>12. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
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
