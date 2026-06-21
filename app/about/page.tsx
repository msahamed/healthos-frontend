import ContentPage from "../components/ContentPage";
import type { Metadata } from "next";

const DESCRIPTION =
  "HealthOS is built by Sabber Ahamed — an applied ML scientist in radiology AI and PhD geophysicist who specializes in signal processing and on-device machine learning, the exact stack voice biomarkers require.";

export const metadata: Metadata = {
  title: "About the founder — HealthOS",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About the founder — HealthOS",
    description: DESCRIPTION,
    url: "https://healthos.live/about",
    siteName: "HealthOS",
    type: "profile",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "HealthOS" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About the founder — HealthOS",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sabber Ahamed",
  jobTitle: "Founder, HealthOS · Applied ML Scientist",
  description:
    "Applied ML scientist in radiology AI and PhD geophysicist specializing in signal processing, computer vision, and on-device machine learning.",
  url: "https://healthos.live/about",
  worksFor: { "@type": "Organization", name: "HealthOS", url: "https://healthos.live" },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Memphis",
  },
  knowsAbout: [
    "Voice biomarkers",
    "Signal processing",
    "On-device machine learning",
    "Computer vision",
    "Medical AI",
  ],
  sameAs: [
    "https://www.linkedin.com/in/sabber-ahamed/",
    "https://github.com/msahamed",
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
      />
      <ContentPage
        eyebrow="The founder"
        title={
          <>
            Built by a signal scientist who owns the{" "}
            <em>whole pipeline.</em>
          </>
        }
        lede="HealthOS is the work of Sabber Ahamed — an applied ML scientist in radiology AI and a PhD geophysicist who has spent his career turning signals into deployable, on-device models."
      >
        <p className="lead">
          Voice biomarkers sit at the intersection of three hard disciplines:
          signal processing, machine learning, and on-device deployment.
          HealthOS is built by someone who has shipped all three in production.
        </p>

        <h2>Why a signal scientist built a voice app</h2>
        <p>
          Sabber&apos;s PhD (University of Memphis, Geophysics &amp;
          Seismology) was built on signal processing — Fourier transforms,
          spectrograms, frequency-domain analysis of seismic waves. The same
          mathematics underlies voice biomarkers: HealthOS reads pitch,
          loudness, pace, pauses, and vocal clarity from the acoustic signal of
          your speech. It&apos;s the field he&apos;s worked in for over a
          decade, pointed at a new signal.
        </p>

        <h2>A career in deployable, real-world AI</h2>
        <p>
          Across radiology, manufacturing, and healthcare, the through-line has
          been building AI that actually ships — not research demos:
        </p>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Applied Scientist, Sirona Medical</td>
              <td>
                Radiology AI — medical image segmentation (95% inference-time
                reduction via ONNX optimization) and multimodal agents on
                fine-tuned medical LLMs.
              </td>
            </tr>
            <tr>
              <td>Lead Data Scientist, Healthpilot</td>
              <td>
                LLM agents and recommender systems for Medicare plan
                enrollment.
              </td>
            </tr>
            <tr>
              <td>Senior Data Scientist, Bridgestone</td>
              <td>
                Computer vision on X-ray images for manufacturing defect
                detection; forecasting and anomaly detection.
              </td>
            </tr>
            <tr>
              <td>Data Scientist, Asurion</td>
              <td>
                Real-time fraud detection and NLP analysis of speech and social
                data.
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Why HealthOS</h2>
        <p>
          Sabber saw voice biomarkers stuck in research labs and clinical B2B
          companies — powerful science with no consumer product on the iPhone
          people already carry. Because he owns the full stack — ML modeling,
          signal processing, on-device deployment, and iOS — he could build
          what those teams couldn&apos;t package: a fully on-device voice
          biomarker app where your audio never leaves your phone. The on-device
          ML (Whisper for transcription, a small Qwen model, INT4/INT8
          quantization) is work he has documented in depth.
        </p>
        <p>
          The approach won{" "}
          <strong>
            first prize at Health Wildcatters&apos; 2026 TXHCC Hackathon
          </strong>{" "}
          for ColonOwl, a voice agent for colonoscopy navigation.
        </p>

        <h2>The methodology principle</h2>
        <p>
          HealthOS doesn&apos;t invent its own science. Every signal is a
          transparent, deterministic formula composed of acoustic features
          whose links to nervous-system state are grounded in decades of
          peer-reviewed speech research. The reads are relative to your own
          baseline, and the limits are stated openly — the same engineering
          honesty Sabber applies to production models.
        </p>

        <p className="src">
          Connect: {""}
          <a
            href="https://www.linkedin.com/in/sabber-ahamed/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/msahamed"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </ContentPage>
    </>
  );
}
