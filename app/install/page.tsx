import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

// ── /install: beta setup + update steps for invited users (linked from
// invite emails). Deliberately unlisted: noindex + not in the sitemap or site
// nav, because the Android link is a closed internal-testing track, not a
// public listing. Supports ?email=<their@gmail.com> so the invite email can
// pre-fill the exact Google account the Play Store must be signed into.
//
// Layout: one card per platform, Install | Update as side-by-side columns
// (stacked on phones), every step numbered with a "Step N" badge.

const IOS_LINK = "https://testflight.apple.com/join/JBG3ANFF";
const ANDROID_LINK =
  "https://play.google.com/apps/internaltest/4701391287312603731";

export const metadata: Metadata = {
  title: "Install Ontor (beta)",
  description: "Setup and update steps for Ontor beta access on iPhone and Android.",
  robots: { index: false, follow: false },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function InstallPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).email;
  const email =
    typeof raw === "string" && EMAIL_RE.test(raw.trim())
      ? raw.trim().toLowerCase()
      : null;
  const accountName = email ? (
    <strong className="in-email">{email}</strong>
  ) : (
    <strong>the email your invite was sent to</strong>
  );

  return (
    <>
      <Nav />

      <main id="top" className="flex-1">
        <section className="in-hero">
          <div className="in-wrap">
            <span className="in-eyebrow">Beta access</span>
            <h1 className="font-serif-display">Get Ontor on your phone.</h1>
            <p className="in-lede">
              You&apos;re in. Ontor is in private beta, so setup takes a couple
              of extra steps &mdash; about a minute on iPhone, a few more on
              Android. Pick your phone:
            </p>
            <div className="in-jump">
              <a href="#iphone">iPhone</a>
              <a href="#android">Android</a>
            </div>
          </div>
        </section>

        <section className="in-body">
          <div className="in-wrap">
            {/* ── iPhone ── */}
            <div className="in-card" id="iphone">
              <h2> iPhone</h2>
              <div className="in-cols">
                <div className="in-col">
                  <h3>Install</h3>
                  <p className="in-note">
                    Goes through Apple&apos;s TestFlight app. No invitation
                    code is needed at any point.
                  </p>
                  <ol className="in-steps">
                    <li>
                      <strong>Open the invite link on your iPhone:</strong>
                      <br />
                      <a href={IOS_LINK} className="in-link">
                        {IOS_LINK.replace("https://", "")}
                      </a>
                    </li>
                    <li>
                      <strong>Install TestFlight if asked.</strong>{" "}If you
                      don&apos;t have Apple&apos;s TestFlight app yet, the link
                      sends you to the App Store to install it first. This is
                      normal.
                    </li>
                    <li>
                      <strong>Come back and tap the link again.</strong> After
                      TestFlight finishes installing, return here and tap the
                      invite link a second time. It opens TestFlight straight
                      to Ontor.
                    </li>
                    <li>
                      <strong>Tap Accept, then Install.</strong>{" "}You&apos;ll
                      see Ontor with an Accept and an Install button. Tap them
                      and you&apos;re in.
                    </li>
                  </ol>
                  <div className="in-warn">
                    If you see a <strong>&ldquo;Redeem Code&rdquo;</strong>{" "}box
                    asking for an invitation code, don&apos;t type anything.
                    That screen just means TestFlight was opened on its own.
                    Close it, come back to the invite link above, and tap it
                    again &mdash; you never need a code.
                  </div>
                </div>

                <div className="in-col">
                  <h3>Update</h3>
                  <p className="in-note">
                    We ship new builds often during beta. Takes about 30
                    seconds:
                  </p>
                  <ol className="in-steps">
                    <li>
                      On your iPhone, open the <strong>TestFlight</strong> app.
                    </li>
                    <li>
                      Tap <strong>Ontor</strong> in your list.
                    </li>
                    <li>
                      Tap <strong>Update</strong>. If it says Open instead,
                      you&apos;re already on the latest build.
                    </li>
                    <li>
                      Optional: turn on <strong>Automatic Updates</strong> on
                      that same page and future builds install themselves.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* ── Android ── */}
            <div className="in-card" id="android">
              <h2> Android</h2>
              <p className="in-note in-note-wide">
                The key thing for both install and updates: your phone&apos;s
                Play Store must be signed into {accountName}. That&apos;s the
                account we added as a tester, and the link only works for it.
              </p>
              <div className="in-cols">
                <div className="in-col">
                  <h3>Install</h3>
                  <ol className="in-steps">
                    <li>
                      On your Android phone, open the{" "}
                      <strong>Play Store</strong> app.
                    </li>
                    <li>
                      Tap your <strong>profile picture</strong> (top-right
                      corner).
                    </li>
                    <li>
                      <strong>Check the email shown there.</strong> It must be{" "}
                      {accountName}. If it shows a different one, tap it and
                      switch accounts.
                    </li>
                    <li>
                      <strong>Now open this link on the phone:</strong>
                      <br />
                      <a href={ANDROID_LINK} className="in-link">
                        play.google.com/apps/internaltest/&hellip;
                      </a>
                    </li>
                    <li>
                      On that page, tap{" "}
                      <strong>&ldquo;Become a tester&rdquo;</strong> (or
                      Accept).
                    </li>
                    <li>
                      <strong>Wait about 5&ndash;10 minutes.</strong> Google
                      needs a moment to activate it.
                    </li>
                    <li>
                      Go back to that same link and tap{" "}
                      <strong>&ldquo;Download it on Google Play&rdquo;</strong>{" "}
                      &rarr; Install.
                    </li>
                    <li>Open Ontor 🎉</li>
                  </ol>
                  <div className="in-warn">
                    Still says <strong>&ldquo;not available&rdquo;</strong>?
                    It&apos;s almost always the wrong email. Double-check step
                    3, wait a few more minutes, and try again. If your invite
                    went to a different address than your Play Store account,
                    reply to the invite email with the Gmail you actually use
                    on the phone and we&apos;ll add it.
                  </div>
                </div>

                <div className="in-col">
                  <h3>Update</h3>
                  <p className="in-note">
                    Getting the latest build takes about a minute:
                  </p>
                  <ol className="in-steps">
                    <li>
                      Open the <strong>Play Store</strong>, tap your{" "}
                      <strong>profile circle</strong> (top right), and make
                      sure it shows {accountName}. If not, switch to that
                      account.
                    </li>
                    <li>
                      <strong>Tap this link on your phone:</strong>
                      <br />
                      <a href={ANDROID_LINK} className="in-link">
                        play.google.com/apps/internaltest/&hellip;
                      </a>
                    </li>
                    <li>
                      If it asks, tap{" "}
                      <strong>&ldquo;Become a tester&rdquo;</strong>, then{" "}
                      <strong>&ldquo;Download it on Google Play&rdquo;</strong>.
                    </li>
                    <li>
                      On the Ontor page, tap <strong>Update</strong> (or
                      Install).
                    </li>
                    <li>Open Ontor &mdash; you&apos;re on the latest build.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="in-help">
              Stuck on any step? Reply to your invite email &mdash; a human
              (Sabber) reads every one and will get you set up.
            </div>
          </div>
        </section>
      </main>

      <footer className="in-foot">
        <div className="in-wrap in-foot-inner">
          <span className="in-foot-brand">
            <Logo size={26} />
            Ontor
          </span>
          <div className="in-foot-links">
            <Link href="/faq">FAQ</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>

      <style>{INSTALL_CSS}</style>
    </>
  );
}

const INSTALL_CSS = `
.in-wrap { max-width: 1020px; margin: 0 auto; padding: 0 32px; }

.in-hero {
  background: linear-gradient(168deg, #14272C 0%, #0E1D21 60%, #0A1417 100%);
  color: #F4F1EA; padding: 72px 0 56px; text-align: center;
}
.in-eyebrow {
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: #6FD6C9; display: inline-flex; align-items: center; gap: 9px;
}
.in-eyebrow::before {
  content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--amber);
}
.in-hero h1 {
  font-size: clamp(32px, 4.4vw, 46px); line-height: 1.06; margin: 18px 0 0;
  color: #FBF8F1; letter-spacing: -0.02em;
}
.in-lede {
  margin: 16px auto 0; max-width: 540px; font-size: 17px; line-height: 1.6; color: #C9D4D2;
}
.in-jump { margin-top: 26px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.in-jump a {
  color: #E8F2F0; text-decoration: none; font-size: 14px; font-weight: 600;
  border: 1px solid rgba(232,242,240,.28); border-radius: 999px; padding: 8px 18px;
  transition: background .15s, border-color .15s;
}
.in-jump a:hover { background: rgba(111,214,201,.12); border-color: #6FD6C9; }

.in-body { background: var(--paper-3); padding: 56px 0 72px; }
.in-card {
  border: 1px solid var(--line); border-radius: 16px; background: #fff;
  padding: 28px 28px 26px; margin-bottom: 22px; scroll-margin-top: 24px;
}
.in-card h2 {
  margin: 0 0 16px; font-size: clamp(26px, 3.2vw, 32px); font-weight: 700;
  color: var(--ink); letter-spacing: -0.015em;
}
.in-cols {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0 36px; align-items: start;
}
.in-col:first-child { border-right: 1px solid var(--line); padding-right: 36px; }
.in-col h3 {
  margin: 0 0 10px; font-size: 12.5px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--teal);
}
.in-note { margin: 0 0 16px; font-size: 14.5px; line-height: 1.6; color: var(--ink-soft); }
.in-note-wide { max-width: 70ch; }

/* "Step N" badged list */
.in-steps { margin: 0; padding: 0; list-style: none; counter-reset: step; }
.in-steps li {
  counter-increment: step;
  position: relative; padding-left: 0; margin-bottom: 16px;
  font-size: 15px; line-height: 1.6; color: var(--ink-soft);
}
.in-steps li::before {
  content: "Step " counter(step);
  display: table; margin-bottom: 5px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: #B45309; background: var(--amber-soft); border: 1px solid var(--amber-border);
  border-radius: 999px; padding: 2px 10px;
}
.in-steps li:last-child { margin-bottom: 0; }
.in-steps strong { color: var(--ink); }
.in-link { color: var(--teal); font-weight: 600; text-decoration: none; word-break: break-all; }
.in-link:hover { text-decoration: underline; }
.in-email { color: var(--teal); overflow-wrap: break-word; }
.in-warn {
  margin-top: 18px; border: 1px solid #E8D9B8; background: #FBF6E9; border-radius: 12px;
  padding: 13px 16px; font-size: 14px; line-height: 1.6; color: #6B5A2E;
}
.in-help { text-align: center; margin-top: 36px; font-size: 15px; color: var(--ink-soft); }

.in-foot { border-top: 1px solid var(--line); padding: 32px 0 48px; background: var(--paper); }
.in-foot-inner { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.in-foot-brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: var(--ink); }
.in-foot-links { display: flex; gap: 22px; font-size: 14px; color: var(--ink-soft); }
.in-foot-links a { color: inherit; text-decoration: none; transition: color .15s; }
.in-foot-links a:hover { color: var(--ink); }

@media (max-width: 720px) {
  .in-cols { grid-template-columns: 1fr; gap: 28px 0; }
  .in-col:first-child { border-right: none; padding-right: 0; border-bottom: 1px solid var(--line); padding-bottom: 28px; }
}
@media (max-width: 560px) {
  .in-wrap { padding: 0 20px; }
  .in-hero { padding: 56px 0 44px; }
  .in-card { padding: 22px 18px 20px; }
}
`;
