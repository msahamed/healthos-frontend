import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import BackLink from "../_components/BackLink";
import InstallFooter from "../_components/InstallFooter";
import { WindowsIcon } from "../_components/icons";
import { INSTALL_SHARED_CSS } from "../_lib/shared-css";
import { extractEmail, type SearchParams } from "../_lib/query";
import WindowsWaitlistForm from "./WindowsWaitlistForm";

// ── /install/windows: honest coming-soon state, no fake download
// button. Public and left out of the sitemap (nothing to index yet).

export const metadata: Metadata = {
  title: "Ontor for Windows (coming soon)",
  description: "Ontor for Windows is on the way. Leave your email and we'll tell you the day it's ready.",
};

export default async function InstallWindowsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const email = await extractEmail(searchParams);

  return (
    <>
      <Nav />

      <main id="top" className="flex-1">
        <BackLink email={email} />

        <div className="wn-wrap">
          <div className="wn-card">
            <span className="wn-icon"><WindowsIcon size={34} /></span>
            <span className="inst-badge is-soon">Coming soon</span>
            <h1 className="font-serif-display">Ontor for Windows is coming.</h1>
            <p>
              We&apos;re finishing the Windows build. Leave your email and
              we&apos;ll tell you the day it&apos;s ready.
            </p>
            <WindowsWaitlistForm />
          </div>
        </div>
      </main>

      <InstallFooter />

      <style>{INSTALL_SHARED_CSS + WINDOWS_CSS}</style>
    </>
  );
}

const WINDOWS_CSS = `
.wn-wrap { padding: 44px 32px 64px; display: flex; justify-content: center; }
.wn-card {
  max-width: 420px; width: 100%; text-align: center; background: #fff;
  border: 1px dashed var(--line-strong); border-radius: 16px; padding: 32px 28px 28px;
}
.wn-icon { display: block; width: 34px; height: 34px; color: var(--ink-soft); margin: 0 auto 14px; }
.wn-card h1 { font-size: 22px; margin: 14px 0 0; color: var(--ink); }
.wn-card p { font-size: 13.5px; color: var(--ink-soft); margin: 9px 0 0; line-height: 1.6; }

.wn-form { display: flex; gap: 8px; margin-top: 20px; }
.wn-form input {
  flex: 1; border: 1px solid var(--line-strong); border-radius: 10px; padding: 11px 13px;
  font-size: 14px; background: #fff; color: var(--ink); font-family: inherit;
}
.wn-form input:focus { outline: 2px solid var(--teal); outline-offset: 1px; }
.wn-form button {
  background: var(--ink); color: var(--paper); border: none; border-radius: 10px; padding: 11px 16px;
  font-size: 13.5px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: inherit;
}
.wn-form button:disabled { opacity: .7; cursor: default; }
.wn-success { margin-top: 20px; font-size: 14px; font-weight: 600; color: var(--teal-dark); }
.wn-error { margin-top: 10px; font-size: 13px; color: #B91C1C; }

@media (max-width: 420px) { .wn-form { flex-direction: column; } }
`;
