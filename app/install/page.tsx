import Nav from "../components/Nav";
import type { Metadata } from "next";
import { extractEmail, withEmail, type SearchParams } from "./_lib/query";
import { INSTALL_SHARED_CSS } from "./_lib/shared-css";
import PlatformTile from "./_components/PlatformTile";
import InstallFooter from "./_components/InstallFooter";
import { LaptopIcon, PhoneIcon, AndroidIcon, WindowsIcon } from "./_components/icons";

// ── /install: platform chooser, the front door for all installs.
// Public and indexable — replaces the old single gated page. Everyone
// lands here first and picks a platform; desktop builds are public,
// while iOS/Android stay invite-only. Old #iphone anchor (pre-split /install page) simply
// no-ops here, nothing to scroll to and nothing errors.
//
// Supports ?email=<their@gmail.com> from invite emails, forwarded onto
// every tile so the platform page never has to ask again.

export const metadata: Metadata = {
  title: "Install Ontor",
  description: "Get Ontor for Mac or Windows. iPhone and Android are currently available by invitation.",
};

export default async function InstallChooserPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const email = await extractEmail(searchParams);
  const link = (path: string) => withEmail(path, email);

  return (
    <>
      <Nav />

      <main id="top" className="flex-1">
        <section className="ch-hero">
          <div className="inst-wrap">
            <span className="ch-eyebrow">Install</span>
            <h1 className="font-serif-display">Get Ontor on your machine.</h1>
            <p>
              Pick your platform. Mac and Windows are available today. iPhone
              and Android are invite-only while we&apos;re in private beta.
            </p>
          </div>
        </section>

        <section className="inst-body">
          <div className="inst-wrap">
            <div className="ch-tiles">
              <PlatformTile
                href={link("/install/mac")}
                state="live"
                icon={<LaptopIcon />}
                title="Mac"
                description="Direct download, notarized by Apple. No invite needed."
                ctaLabel="Download for Mac"
              />
              <PlatformTile
                href={link("/install/ios")}
                state="locked"
                icon={<PhoneIcon />}
                title="iPhone"
                description="Invite required right now."
                ctaLabel="See install steps"
              />
              <PlatformTile
                href={link("/install/android")}
                state="locked"
                icon={<AndroidIcon />}
                title="Android"
                description="Invite required right now."
                ctaLabel="See install steps"
              />
              <PlatformTile
                href={link("/install/windows")}
                state="live"
                icon={<WindowsIcon />}
                title="Windows"
                description="Direct beta download. No invite needed."
                ctaLabel="Download for Windows"
              />
            </div>
          </div>
        </section>
      </main>

      <InstallFooter />

      <style>{INSTALL_SHARED_CSS + CHOOSER_CSS}</style>
    </>
  );
}

const CHOOSER_CSS = `
.ch-hero {
  background: linear-gradient(168deg, #14272C 0%, #0E1D21 60%, #0A1417 100%);
  color: #F4F1EA; padding: 72px 0 48px; text-align: center;
}
.ch-eyebrow {
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: #6FD6C9; display: inline-flex; align-items: center; gap: 9px;
}
.ch-eyebrow::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--amber); }
.ch-hero h1 {
  font-size: clamp(32px, 4.4vw, 44px); line-height: 1.08; margin: 18px 0 0;
  color: #FBF8F1; letter-spacing: -0.02em;
}
.ch-hero p { margin: 16px auto 0; max-width: 520px; font-size: 16px; line-height: 1.6; color: #C9D4D2; }

.ch-tiles { padding: 40px 0 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.ch-tile {
  border-radius: 14px; padding: 20px 18px 18px; display: flex; flex-direction: column; gap: 10px;
  background: #fff; border: 1px solid var(--line-strong); text-decoration: none; color: inherit;
  transition: transform .15s ease, box-shadow .15s ease;
}
.ch-tile:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -18px rgba(0,0,0,.35); }
.ch-tile.is-live { background: var(--teal-surface); border-color: var(--teal); }
.ch-tile.is-soon { border-style: dashed; opacity: .85; }
.ch-icon { width: 30px; height: 30px; color: var(--ink); }
.ch-tile.is-live .ch-icon { color: var(--teal-dark); }
.ch-tile h3 { font-size: 17px; font-weight: 700; color: var(--ink); margin: 0; }
.ch-tile p { font-size: 12.5px; color: var(--ink-soft); margin: 0; line-height: 1.5; min-height: 2.6em; }
.ch-cta { font-size: 12.5px; font-weight: 700; margin-top: auto; display: inline-flex; align-items: center; gap: 5px; }
.ch-cta.is-live { color: var(--teal-dark); }
.ch-cta.is-quiet { color: var(--ink-soft); }

@media (max-width: 820px) { .ch-tiles { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .ch-tiles { grid-template-columns: 1fr; } }
`;
