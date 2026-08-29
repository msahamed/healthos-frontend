import Nav from "../components/Nav";
import type { Metadata } from "next";
import { extractEmail, withEmail, type SearchParams } from "./_lib/query";
import { INSTALL_SHARED_CSS } from "./_lib/shared-css";
import PlatformTile from "./_components/PlatformTile";
import InstallFooter from "./_components/InstallFooter";
import { LaptopIcon, PhoneIcon, AndroidIcon, WindowsIcon } from "./_components/icons";

// ── /install: platform chooser, the front door for all installs.
// Public and indexable — replaces the old single gated page. Everyone
// lands here first and picks a platform. Desktop builds are the primary,
// public path; iOS and Android remain a quieter, invite-only path.
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
            <p className="ch-eyebrow">Install Ontor</p>
            <h1 className="font-serif-display">Use Ontor on your computer.</h1>
            <p>
              Download Ontor for Mac or Windows. Mobile builds are still
              limited to invited testers.
            </p>
          </div>
        </section>

        <section className="inst-body">
          <div className="inst-wrap">
            <div className="ch-primary">
              <PlatformTile
                href={link("/install/mac")}
                state="live"
                icon={<LaptopIcon />}
                title="Mac"
                description="Notarized download for macOS 14 or later."
                ctaLabel="Download for Mac"
              />
              <PlatformTile
                href={link("/install/windows")}
                state="live"
                icon={<WindowsIcon />}
                title="Windows"
                description="Beta installer for 64-bit Windows 10 or later."
                ctaLabel="Download for Windows"
              />
            </div>

            <div className="ch-private">
              <div className="ch-private-copy">
                <h2>Mobile access is private for now.</h2>
                <p>
                  Already invited? Open the setup instructions for your phone
                  using the email address from your invitation.
                </p>
              </div>
              <div className="ch-private-platforms">
                <PlatformTile
                  href={link("/install/ios")}
                  state="locked"
                  icon={<PhoneIcon />}
                  title="iPhone"
                  description="Available to invited testers through TestFlight."
                  ctaLabel="iPhone setup"
                />
                <PlatformTile
                  href={link("/install/android")}
                  state="locked"
                  icon={<AndroidIcon />}
                  title="Android"
                  description="Available to invited testers through Google Play."
                  ctaLabel="Android setup"
                />
              </div>
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
  padding: 88px 0 58px; background: var(--paper);
}
.ch-eyebrow {
  margin: 0 0 15px; color: var(--teal); font-size: 12px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
}
.ch-hero h1 {
  max-width: 760px; margin: 0; color: var(--ink); font-size: clamp(40px, 5.4vw, 64px);
  font-weight: 800; line-height: 1.03; letter-spacing: -.034em; text-wrap: balance;
}
.ch-hero .inst-wrap > p:last-child {
  max-width: 620px; margin: 24px 0 0; color: var(--ink-soft); font-size: 19px; line-height: 1.55;
}

.inst-body { padding: 0 0 96px; background: var(--paper); }
.ch-primary { display: grid; gap: 14px; }
.ch-tile {
  display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; grid-template-areas:
    "icon badge cta" "icon title cta" "icon copy cta";
  column-gap: 18px; align-items: center; padding: 24px 26px; border: 1px solid var(--line);
  border-radius: 14px; background: #fff; color: inherit; text-decoration: none;
  transition: border-color .18s ease, background .18s ease;
}
.ch-tile:hover { border-color: var(--teal); background: #FCFEFD; }
.ch-tile:focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; }
.ch-icon {
  grid-area: icon; display: grid; width: 48px; height: 48px; place-items: center;
  border-radius: 12px; background: var(--teal-surface); color: var(--ink);
}
.ch-tile.is-live .ch-icon { color: var(--teal-dark); }
.ch-tile .inst-badge { grid-area: badge; justify-self: start; margin-bottom: 5px; }
.ch-tile h3 { grid-area: title; margin: 0; color: var(--ink); font-size: 22px; font-weight: 750; }
.ch-tile p { grid-area: copy; margin: 2px 0 0; color: var(--ink-soft); font-size: 14px; line-height: 1.5; }
.ch-cta {
  grid-area: cta; display: inline-flex; align-items: center; gap: 7px; min-height: 44px;
  padding: 0 17px; border-radius: 11px; font-size: 14px; font-weight: 700;
}
.ch-cta.is-live { background: var(--teal); color: #fff; }
.ch-cta.is-quiet { color: var(--ink-soft); }

.ch-private { margin-top: 72px; padding-top: 38px; border-top: 1px solid var(--line); }
.ch-private-copy { max-width: 600px; }
.ch-private-copy h2 {
  margin: 0; color: var(--ink); font-size: clamp(27px, 3.4vw, 38px); font-weight: 800;
  line-height: 1.1; letter-spacing: -.025em;
}
.ch-private-copy p { margin: 14px 0 0; color: var(--ink-soft); font-size: 16px; line-height: 1.6; }
.ch-private-platforms { display: grid; gap: 10px; margin-top: 26px; }
.ch-private .ch-tile { padding: 18px 20px; }
.ch-private .ch-icon { width: 42px; height: 42px; background: var(--paper-2); color: var(--ink-soft); }
.ch-private .ch-tile h3 { font-size: 17px; }
.ch-private .ch-tile p { font-size: 13px; }
.ch-private .inst-badge { display: none; }
.ch-private .ch-cta { min-height: auto; padding: 0; font-size: 13px; }

@media (max-width: 640px) {
  .ch-hero { padding: 56px 0 44px; }
  .ch-hero h1 { font-size: 38px; }
  .ch-hero .inst-wrap > p:last-child { font-size: 17px; }
  .inst-body { padding-bottom: 72px; }
  .ch-tile { grid-template-columns: 44px 1fr; grid-template-areas:
    "icon badge" "icon title" "copy copy" "cta cta"; padding: 20px; }
  .ch-icon { width: 44px; height: 44px; }
  .ch-tile p { margin-top: 14px; }
  .ch-cta { justify-self: stretch; justify-content: center; margin-top: 16px; }
  .ch-private { margin-top: 56px; padding-top: 30px; }
  .ch-private .ch-tile { grid-template-areas: "icon title" "copy copy" "cta cta"; }
  .ch-private .ch-tile p { margin-top: 10px; }
  .ch-private .ch-cta { justify-self: start; margin-top: 10px; }
}
`;
