// Public account-deletion page. Google Play requires a URL, reachable
// without installing the app, that explains how to delete an account and
// exactly what gets deleted — the in-app flow alone does not satisfy it.
// This URL goes in the Play Console Data Safety form.

import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete your account — Ontor",
  description:
    "How to permanently delete your Ontor account, your check-ins, and your recordings.",
};

const TEAL = "#0F766E";
const TEAL_LIGHT = "#F0FDFA";

export default function DeleteAccountPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="py-14 md:py-20" style={{ backgroundColor: TEAL_LIGHT }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Delete your account
            </h1>
            <p className="text-slate-500">
              Permanent, and nothing can be restored afterwards.
            </p>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">
            <h2>From inside Ontor</h2>
            <ol>
              <li>Open Ontor.</li>
              <li>Go to <strong>Settings</strong>.</li>
              <li>Tap <strong>Delete account</strong> at the bottom.</li>
              <li>Confirm.</li>
            </ol>

            <h2>What gets deleted</h2>
            <ul>
              <li>Your account and sign-in details.</li>
              <li>Every check-in, along with the signals read from it.</li>
              <li>Every voice recording, on your device and in cloud backup.</li>
              <li>Your usage and diagnostic history.</li>
              <li>Anything you shared with a coach, and their access to it.</li>
            </ul>
            <p>
              Nothing is kept, and none of it can be recovered. Deleting the app
              on its own does <strong>not</strong> delete a cloud backup — use
              the steps above if you have ever turned sync on.
            </p>

            <h2>If you can&apos;t reach the app</h2>
            <p>
              If you have lost access to your device, email{" "}
              <a href="mailto:sabber@ontor.ai" style={{ color: TEAL }}>
                sabber@ontor.ai
              </a>{" "}
              from the address on your account and we will delete it for you.
            </p>

            <p>
              See our <Link href="/privacy" style={{ color: TEAL }}>Privacy Policy</Link>{" "}
              for what Ontor stores and why.
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
