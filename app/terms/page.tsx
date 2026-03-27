import Nav from "../components/Nav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — HealthOS",
  description: "HealthOS terms of use. Read before connecting your hospital account or using the app.",
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
            <p className="text-slate-500">Last updated: March 27, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10 not-prose">
              <p className="text-sm font-semibold text-amber-800 mb-1">Not a medical device</p>
              <p className="text-sm text-amber-700">
                HealthOS is a personal health record organizer, not a medical device or clinical tool.
                It does not provide medical advice, diagnosis, or treatment. Always consult a qualified
                healthcare professional for medical decisions.
              </p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By downloading or using HealthOS (&quot;the App&quot;), you agree to these Terms of Use.
              If you do not agree, do not use the App. These terms govern your use of the App
              and any related services provided by HealthOS.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              HealthOS is a personal health record management application that allows you to:
            </p>
            <ul>
              <li>Scan, import, and organize health documents</li>
              <li>Extract structured health data using on-device AI</li>
              <li>Connect to hospital EHR systems via SMART on FHIR to retrieve your records</li>
              <li>Ask questions about your health records using on-device AI</li>
            </ul>

            <h2>3. Not Medical Advice</h2>
            <p>
              HealthOS is a personal information management tool. The information and AI-generated
              summaries provided by the App are for informational purposes only and do not constitute
              medical advice, diagnosis, or treatment recommendations. Always seek the advice of a
              physician or other qualified health provider with any questions you may have regarding
              a medical condition.
            </p>

            <h2>4. SMART on FHIR and Hospital Connections</h2>
            <p>
              When connecting to a hospital or health system via SMART on FHIR:
            </p>
            <ul>
              <li>You authorize HealthOS to retrieve your health records on your behalf</li>
              <li>You are responsible for maintaining the confidentiality of your hospital credentials</li>
              <li>HealthOS acts as a data recipient — you are authorizing access under your hospital&apos;s patient portal terms</li>
              <li>You may revoke access at any time through the App or directly through your hospital&apos;s patient portal</li>
            </ul>

            <h2>5. Your Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Use the App only for personal, non-commercial health record management</li>
              <li>Not use the App to store records belonging to other individuals without their explicit consent</li>
              <li>Keep your device secure to protect your health data</li>
              <li>Not attempt to reverse-engineer, decompile, or modify the App</li>
            </ul>

            <h2>6. Data Ownership</h2>
            <p>
              You retain full ownership of all health data stored in the App. HealthOS does not
              claim any ownership of your health records or documents. As a local-first application,
              your data remains on your device under your control at all times.
            </p>

            <h2>7. Disclaimer of Warranties</h2>
            <p>
              The App is provided &quot;as is&quot; without warranty of any kind. HealthOS does not warrant
              that the App will be error-free, that extracted data will be accurate or complete,
              or that AI-generated summaries will be free from inaccuracies. AI extraction is
              assistive and may make errors — always verify important medical information against
              your original documents.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, HealthOS shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of
              the App, including but not limited to reliance on AI-extracted health information
              for medical decisions.
            </p>

            <h2>9. Intellectual Property</h2>
            <p>
              The HealthOS app, including its design, code, and AI models (excluding open-source
              components), is the intellectual property of HealthOS. You are granted a limited,
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
              <a href="mailto:sabber@healthos.live" style={{ color: TEAL }}>sabber@healthos.live</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: TEAL }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">HealthOS</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Use</Link>
            <a href="mailto:sabber@healthos.live" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} HealthOS</p>
        </div>
      </footer>
    </>
  );
}
