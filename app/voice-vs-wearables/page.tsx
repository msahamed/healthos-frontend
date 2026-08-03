import ContentPage from "../components/ContentPage";
import type { Metadata } from "next";

const DESCRIPTION =
  "Voice biomarkers vs wearables (Oura, WHOOP, Apple Watch): wearables track physiology and infer stress; Ontor reads psychological and nervous-system state from your voice. A side-by-side comparison of what each can and can't measure.";

export const metadata: Metadata = {
  title: "Voice biomarkers vs wearables (Oura, WHOOP, Apple Watch) — Ontor",
  description: DESCRIPTION,
  alternates: { canonical: "/voice-vs-wearables" },
  openGraph: {
    title: "Voice biomarkers vs wearables: Oura, WHOOP & Apple Watch",
    description: DESCRIPTION,
    url: "https://ontor.ai/voice-vs-wearables",
    siteName: "Ontor",
    type: "article",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ontor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice biomarkers vs wearables: Oura, WHOOP & Apple Watch",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    q: "Is Ontor an alternative to Oura or WHOOP?",
    a: "Ontor is best understood as complementary rather than a replacement. Oura and WHOOP track physiology — heart rate, HRV, sleep — and infer stress from it. Ontor reads psychological and nervous-system state such as confidence, vocal strain, and expressiveness directly from your voice, which a wrist or finger sensor cannot measure. Many users keep their wearable and add Ontor for the 'mind' layer.",
  },
  {
    q: "Can a wearable measure stress as well as voice?",
    a: "Wearables infer stress indirectly from physiological proxies like heart-rate variability. Voice carries direct cues of psychological state — vocal strain, hedging, and reduced expressiveness — that physiology alone doesn't reveal. They capture different, complementary dimensions of stress.",
  },
  {
    q: "Do I need to buy hardware to use Ontor?",
    a: "No. Ontor runs on the iPhone you already carry — there's no ring or band to buy, charge, or lose. Just takes your natural voice, and runs entirely on-device.",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Voice biomarkers vs wearables: Oura, WHOOP & Apple Watch",
  description: DESCRIPTION,
  author: { "@type": "Organization", name: "Ontor", url: "https://ontor.ai" },
  publisher: { "@type": "Organization", name: "Ontor", url: "https://ontor.ai" },
  mainEntityOfPage: "https://ontor.ai/voice-vs-wearables",
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function VoiceVsWearablesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <ContentPage
        eyebrow="Comparison"
        title={
          <>
            Voice biomarkers vs. wearables: the <em>mind</em> your ring
            can&apos;t read.
          </>
        }
        lede="Oura, WHOOP, and Apple Watch own passive physical tracking. Ontor reads a different layer entirely — and the two work better together."
      >
        <p className="lead">
          Wearables read your body. Your voice reveals your mind. A wrist or
          finger sensor measures physiology and <em>infers</em> stress;
          it physically cannot hear confidence, vocal strain, or hedging.
          That&apos;s a different sensor, not a firmware update.
        </p>

        <h2>The core difference</h2>
        <p>
          Oura, WHOOP, and Apple Watch are excellent at effortless, 24/7
          physiological tracking — heart rate, HRV, temperature, sleep. From
          those signals they estimate stress and readiness. Ontor measures
          something they structurally can&apos;t reach: the psychological and
          nervous-system state carried in <strong>how you sound</strong>.
        </p>

        <h2>Side-by-side</h2>
        <table>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Ontor (voice)</th>
              <th>Oura / WHOOP / Apple Watch</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>What it measures</td>
              <td>
                Psychological &amp; nervous-system state from voice — energy,
                stress, confidence, fatigue, vocal strain, and more
              </td>
              <td>Physiology — heart rate, HRV, temperature, sleep</td>
            </tr>
            <tr>
              <td>How it reads stress</td>
              <td>Directly, from vocal cues</td>
              <td>Indirectly, inferred from physiological proxies</td>
            </tr>
            <tr>
              <td>Hardware</td>
              <td>None — uses your iPhone</td>
              <td>A ring or band to buy and charge ($199–$400+)</td>
            </tr>
            <tr>
              <td>Effort</td>
              <td>Your natural voice</td>
              <td>Passive, zero-effort</td>
            </tr>
            <tr>
              <td>Timing</td>
              <td>&quot;Right now&quot; — tied to a moment</td>
              <td>Mostly &quot;last night&quot; — daily averages</td>
            </tr>
            <tr>
              <td>Privacy</td>
              <td>Analyzed on-device; nothing uploaded unless you opt in</td>
              <td>Synced to the cloud</td>
            </tr>
          </tbody>
        </table>

        <h2>Where wearables win</h2>
        <p>
          Honestly: passive monitoring. A ring on your finger captures data
          while you sleep with zero effort, and Ontor asks for a deliberate
          check-in. If continuous, hands-off physiological tracking is what you
          want, a wearable is the right tool — and Ontor doesn&apos;t try to
          replace it.
        </p>

        <h2>Where voice wins</h2>
        <p>
          The deliberate pause is the point. A check-in is tied to a moment —
          before a high-stakes session, after a hard call — so the read is
          causal and contextual, not a number you scroll past. And it surfaces
          confidence, expressiveness, and vocal strain that no wrist sensor can
          detect. The moment of awareness <em>is</em> the intervention.
        </p>

        <h2>The bottom line</h2>
        <p>
          Ontor isn&apos;t an Oura or WHOOP replacement — it&apos;s the mind
          layer they can&apos;t reach. Keep your ring; it can&apos;t hear you.
          If you want to understand the underlying science, see{" "}
          <a href="/voice-biomarkers">what a voice biomarker is</a>, or read the{" "}
          <a href="/faq">frequently asked questions</a>.
        </p>
      </ContentPage>
    </>
  );
}
