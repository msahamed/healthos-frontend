import Nav from "../components/Nav";
import Logo from "../components/Logo";
import Link from "next/link";
import type { Metadata } from "next";

// ── FAQ: drives both the visible page and the FAQPage schema (GEO).
// Answer-shaped, definitional text so AI answer engines can quote it.
const FAQ: { q: string; a: string }[] = [
  {
    q: "What is HealthOS?",
    a: "HealthOS is a voice-first, on-device iOS app that reads your nervous-system state from how you sound. A daily check-in takes just a few seconds — up to thirty — analyzing your unscripted speech to surface eight signals — energy, stress, fatigue, confidence and more — so you catch shifts before you consciously feel them.",
  },
  {
    q: "How does voice biomarker analysis work?",
    a: "HealthOS reads how you sound, not what you say. Each signal is a transparent, literature-grounded formula that blends acoustic features — pitch, loudness, pace, pauses, vocal clarity — scored against your own roughly 30-day baseline. It's a relative read of what's higher or lower than your usual, not a clinical or population score.",
  },
  {
    q: "Is my voice data private?",
    a: "Yes. All analysis runs entirely on-device. Your voice audio never leaves your phone and is never uploaded to the cloud.",
  },
  {
    q: "How is HealthOS different from Oura, WHOOP, or Apple Watch?",
    a: "Wearables track physiology — heart rate, HRV, sleep — and infer stress from it. HealthOS reads psychological and nervous-system state such as confidence, vocal strain, and expressiveness that a wrist sensor can't detect. There's no hardware to wear, and it works alongside your wearable rather than replacing it.",
  },
  {
    q: "What signals does HealthOS track?",
    a: "Eight: energy, stress, confidence, fatigue, vocal strain, expressiveness, articulation, and breathing — all read from how you sound.",
  },
  {
    q: "Who is HealthOS for?",
    a: "People whose performance and wellbeing depend on catching a bad state early — biohackers and self-trackers, performance-minded professionals, and anyone who wants the mind layer their wearable can't read.",
  },
  {
    q: "Is HealthOS a medical device?",
    a: "No. HealthOS is a general wellness tool for self-awareness. It does not diagnose, treat, or make clinical claims.",
  },
  {
    q: "What does HealthOS cost and what platforms does it support?",
    a: "HealthOS is free while in beta and launches on iPhone (iOS) first, currently via TestFlight.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const PAGE_DESCRIPTION =
  "Frequently asked questions about HealthOS — the voice-first, on-device app that reads your nervous-system state from how you sound. What it is, how voice biomarkers work, privacy, how it compares to wearables, and more.";

export const metadata: Metadata = {
  title: "FAQ — HealthOS",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Frequently Asked Questions — HealthOS",
    description: PAGE_DESCRIPTION,
    url: "https://healthos.live/faq",
    siteName: "HealthOS",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "HealthOS — Your voice is the biomarker that speaks first.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions — HealthOS",
    description: PAGE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <Nav />

      <main id="top" className="flex-1">
        <section className="faq-hero">
          <div className="faq-wrap">
            <span className="faq-eyebrow">Questions</span>
            <h1 className="font-serif-display">
              Frequently asked questions.
            </h1>
            <p className="faq-lede">
              What HealthOS is, how it reads your voice, and how it&apos;s
              different from the wearable on your wrist.
            </p>
          </div>
        </section>

        <section className="faq-body">
          <div className="faq-wrap">
            <div className="faq-list">
              {FAQ.map(({ q, a }) => (
                <details className="faq-item" key={q}>
                  <summary>
                    <span>{q}</span>
                    <svg
                      className="faq-chev"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>

            <div className="faq-cta">
              <h2 className="font-serif-display">
                Still curious what your voice has been telling you?
              </h2>
              <Link href="/#join" className="faq-cta-btn">
                Join the waitlist
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="faq-foot">
        <div className="faq-wrap faq-foot-inner">
          <span className="faq-foot-brand">
            <Logo size={26} />
            HealthOS
          </span>
          <div className="faq-foot-links">
            <Link href="/#signals">What it reveals</Link>
            <Link href="/#join">Waitlist</Link>
            <a
              href="https://discord.gg/SyZPw3cgG"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>

      <style>{FAQ_CSS}</style>
    </>
  );
}

const FAQ_CSS = `
.faq-wrap { max-width: 820px; margin: 0 auto; padding: 0 32px; }

.faq-hero {
  background: linear-gradient(168deg, #14272C 0%, #0E1D21 60%, #0A1417 100%);
  color: #F4F1EA; padding: 80px 0 64px; text-align: center;
}
.faq-eyebrow {
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: #6FD6C9; display: inline-flex; align-items: center; gap: 9px;
}
.faq-eyebrow::before {
  content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--amber);
}
.faq-hero h1 {
  font-size: clamp(34px, 4.6vw, 50px); line-height: 1.06; margin: 18px 0 0;
  color: #FBF8F1; letter-spacing: -0.02em;
}
.faq-lede {
  margin: 18px auto 0; max-width: 560px; font-size: 18px; line-height: 1.6; color: #C9D4D2;
}

.faq-body { background: var(--paper-3); padding: 64px 0 80px; }
.faq-list { margin: 0 auto; }
.faq-item {
  border: 1px solid var(--line); border-radius: 14px;
  background: #fff; padding: 0 22px; margin-bottom: 12px;
  transition: border-color .2s, box-shadow .2s;
}
.faq-item:hover { border-color: var(--line-strong); }
.faq-item[open] { box-shadow: 0 10px 28px rgba(27,26,23,.06); }
.faq-item summary {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  cursor: pointer; list-style: none; padding: 20px 0;
  font-size: 17px; font-weight: 600; color: var(--ink); letter-spacing: -0.01em;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-chev { color: var(--teal); flex: none; transition: transform .25s ease; }
.faq-item[open] .faq-chev { transform: rotate(180deg); }
.faq-item p {
  margin: 0; padding: 0 0 22px; font-size: 15.5px; line-height: 1.62; color: var(--ink-soft);
  max-width: 64ch;
}

.faq-cta { text-align: center; margin-top: 56px; }
.faq-cta h2 { font-size: clamp(24px, 3vw, 32px); line-height: 1.12; margin: 0 auto 22px; max-width: 560px; }
.faq-cta-btn {
  display: inline-block; background: var(--teal); color: #fff; text-decoration: none;
  font-weight: 600; font-size: 15px; border-radius: 12px; padding: 12px 22px;
  box-shadow: 0 6px 18px rgba(15,118,110,.22); transition: transform .15s, box-shadow .2s;
}
.faq-cta-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(15,118,110,.28); }

.faq-foot { border-top: 1px solid var(--line); padding: 32px 0 48px; background: var(--paper); }
.faq-foot-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap;
}
.faq-foot-brand {
  display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: var(--ink);
}
.faq-foot-links { display: flex; gap: 22px; font-size: 14px; color: var(--ink-soft); }
.faq-foot-links a { color: inherit; text-decoration: none; transition: color .15s; }
.faq-foot-links a:hover { color: var(--ink); }

@media (max-width: 560px) {
  .faq-wrap { padding: 0 20px; }
  .faq-hero { padding: 60px 0 48px; }
}
`;
