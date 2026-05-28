import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HealthOS",
  description: "HealthOS privacy policy. We process all data on-device. No health data ever leaves your phone.",
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
            <p className="text-slate-500">Last updated: March 27, 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-10 not-prose">
              <p className="text-sm font-semibold text-emerald-800 mb-1">Our core commitment</p>
              <p className="text-sm text-emerald-700">
                HealthOS is a local-first app. All processing happens on your device. We do not collect,
                transmit, or store your health data on any external server. Your health records belong to you.
              </p>
            </div>

            <h2>1. Information We Process</h2>
            <p>
              HealthOS processes the following types of data entirely on your device:
            </p>
            <ul>
              <li><strong>Health documents</strong> — images, PDFs, and text you scan or import</li>
              <li><strong>Extracted health data</strong> — medications, lab results, diagnoses, and clinical notes derived from your documents by the on-device AI</li>
              <li><strong>Voice recordings</strong> — audio captured for transcription, processed locally by the on-device Whisper model</li>
              <li><strong>FHIR data</strong> — if you connect a hospital account via SMART on FHIR, the retrieved data is stored locally on your device only</li>
            </ul>
            <p>
              None of this data is transmitted to HealthOS servers or third parties.
            </p>

            <h2>2. Data Storage</h2>
            <p>
              All data is stored in a local SQLite database on your device. Original document files
              (images, PDFs) are stored in the app&apos;s private sandbox directory. iCloud backup is
              controlled entirely by your iOS iCloud settings — HealthOS does not independently
              upload data to any cloud service.
            </p>

            <h2>3. On-Device AI</h2>
            <p>
              HealthOS uses two on-device AI models:
            </p>
            <ul>
              <li><strong>Qwen 2.5 1.5B</strong> — for health data extraction and answering questions about your records</li>
              <li><strong>Whisper (ONNX int8)</strong> — for transcribing voice recordings</li>
            </ul>
            <p>
              Both models run entirely on your device. No text or audio is sent to external inference services.
            </p>

            <h2>4. Hospital Connections (SMART on FHIR)</h2>
            <p>
              When you connect a hospital account via SMART on FHIR (e.g., Epic, Cerner):
            </p>
            <ul>
              <li>You authenticate directly with your hospital — HealthOS never sees your hospital credentials</li>
              <li>An access token is stored securely in your device&apos;s keychain</li>
              <li>Retrieved FHIR resources are stored locally on your device only</li>
              <li>You can disconnect any hospital connection at any time from within the app</li>
            </ul>

            <h2>5. Analytics and Tracking</h2>
            <p>
              HealthOS does not use any analytics SDKs, advertising identifiers, or tracking pixels.
              We do not collect crash reports, usage statistics, or any behavioral data.
            </p>

            <h2>6. Camera, Microphone, and Photo Library</h2>
            <p>
              HealthOS requests access to your camera, microphone, and photo library solely for
              document scanning and voice recording. This data is processed on-device and never
              transmitted externally.
            </p>

            <h2>7. Children&apos;s Privacy</h2>
            <p>
              HealthOS is not directed at children under 13. We do not knowingly collect personal
              information from children.
            </p>

            <h2>8. Your Rights</h2>
            <p>You have full control over your data:</p>
            <ul>
              <li><strong>Delete</strong> — delete individual records or all data from within the app</li>
              <li><strong>Export</strong> — export your records at any time</li>
              <li><strong>Disconnect</strong> — disconnect hospital connections from the app settings</li>
            </ul>
            <p>
              Deleting the app from your device removes all locally stored data.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy as new features are added. Material changes will be
              communicated via an in-app notice. Continued use of the app after changes
              constitutes acceptance.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions about this policy? Contact us at{" "}
              <a href="mailto:sabber@healthos.live" style={{ color: TEAL }}>sabber@healthos.live</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
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
