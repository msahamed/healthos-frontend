import Nav from "./Nav";
import Logo from "./Logo";
import Link from "next/link";

// Shared shell for editorial content pages (explainers, comparisons, about).
// Renders Nav, a dark hero, a paper article body, and the footer.
export default function ContentPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />

      <main id="top" className="flex-1">
        <section className="cp-hero">
          <div className="cp-wrap">
            <span className="cp-eyebrow">{eyebrow}</span>
            <h1 className="font-serif-display">{title}</h1>
            {lede ? <p className="cp-lede">{lede}</p> : null}
          </div>
        </section>

        <section className="cp-body">
          <div className="cp-wrap">
            <article className="cp-prose">{children}</article>

            <div className="cp-cta">
              <h2 className="font-serif-display">
                See what your voice has been telling you.
              </h2>
              <Link href="/#join" className="cp-cta-btn">
                Join the waitlist
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="cp-foot">
        <div className="cp-wrap cp-foot-inner">
          <span className="cp-foot-brand">
            <Logo size={26} />
            HealthOS
          </span>
          <div className="cp-foot-links">
            <Link href="/#signals">What it reveals</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/voice-biomarkers">Voice biomarkers</Link>
            <a
              href="https://discord.gg/SyZPw3cgG"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <Link href="/#join">Waitlist</Link>
          </div>
        </div>
      </footer>

      <style>{CONTENT_CSS}</style>
    </>
  );
}

const CONTENT_CSS = `
.cp-wrap { max-width: 820px; margin: 0 auto; padding: 0 32px; }

.cp-hero {
  background: linear-gradient(168deg, #14272C 0%, #0E1D21 60%, #0A1417 100%);
  color: #F4F1EA; padding: 78px 0 60px;
}
.cp-eyebrow {
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: #6FD6C9; display: inline-flex; align-items: center; gap: 9px;
}
.cp-eyebrow::before {
  content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--amber);
}
.cp-hero h1 {
  font-size: clamp(32px, 4.4vw, 48px); line-height: 1.08; margin: 18px 0 0;
  color: #FBF8F1; letter-spacing: -0.02em; max-width: 18ch;
}
.cp-hero h1 em { font-style: italic; color: #FCD34D; }
.cp-lede {
  margin: 20px 0 0; max-width: 620px; font-size: 19px; line-height: 1.6; color: #C9D4D2;
}

.cp-body { background: var(--paper-3); padding: 60px 0 80px; }
.cp-prose {
  background: #fff; border: 1px solid var(--line); border-radius: 18px;
  padding: 44px 48px;
}
.cp-prose > *:first-child { margin-top: 0; }
.cp-prose h2 {
  font-family: var(--font-newsreader), Georgia, serif; font-weight: 600;
  font-size: 26px; line-height: 1.2; letter-spacing: -0.01em; color: var(--ink);
  margin: 38px 0 0;
}
.cp-prose h3 {
  font-size: 18px; font-weight: 700; color: var(--ink); margin: 26px 0 0;
}
.cp-prose p {
  font-size: 16.5px; line-height: 1.68; color: var(--ink-soft); margin: 14px 0 0;
}
.cp-prose strong { color: var(--ink); font-weight: 650; }
.cp-prose a { color: var(--teal); text-decoration: underline; text-underline-offset: 2px; }
.cp-prose ul { margin: 14px 0 0; padding-left: 22px; }
.cp-prose li { font-size: 16.5px; line-height: 1.62; color: var(--ink-soft); margin: 7px 0 0; }
.cp-prose .lead {
  font-size: 18.5px; line-height: 1.6; color: var(--ink); font-weight: 500;
  border-left: 3px solid var(--teal); padding-left: 18px; margin: 0;
}
.cp-prose table {
  width: 100%; border-collapse: collapse; margin: 22px 0 0; font-size: 15px;
}
.cp-prose th, .cp-prose td {
  text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--line);
  vertical-align: top; line-height: 1.5;
}
.cp-prose thead th {
  font-weight: 700; color: var(--ink); background: var(--paper-2);
  border-bottom: 1px solid var(--line-strong);
}
.cp-prose tbody td { color: var(--ink-soft); }
.cp-prose tbody td:first-child { color: var(--ink); font-weight: 600; }
.cp-prose .src {
  font-size: 13.5px; color: var(--ink-soft); margin-top: 30px;
  border-top: 1px dashed var(--line); padding-top: 16px;
}
.cp-prose .src a { color: var(--ink-soft); }

.cp-cta { text-align: center; margin-top: 52px; }
.cp-cta h2 { font-size: clamp(24px, 3vw, 32px); line-height: 1.12; margin: 0 auto 22px; max-width: 540px; }
.cp-cta-btn {
  display: inline-block; background: var(--teal); color: #fff; text-decoration: none;
  font-weight: 600; font-size: 15px; border-radius: 12px; padding: 12px 22px;
  box-shadow: 0 6px 18px rgba(15,118,110,.22); transition: transform .15s, box-shadow .2s;
}
.cp-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(15,118,110,.28); }

.cp-foot { border-top: 1px solid var(--line); padding: 32px 0 48px; background: var(--paper); }
.cp-foot-inner { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.cp-foot-brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: var(--ink); }
.cp-foot-links { display: flex; gap: 20px; flex-wrap: wrap; font-size: 14px; color: var(--ink-soft); }
.cp-foot-links a { color: inherit; text-decoration: none; transition: color .15s; }
.cp-foot-links a:hover { color: var(--ink); }

@media (max-width: 560px) {
  .cp-wrap { padding: 0 20px; }
  .cp-prose { padding: 28px 22px; }
  .cp-hero { padding: 56px 0 44px; }
}
`;
