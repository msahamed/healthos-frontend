// GET /llms.txt — generated at build time so the blog link list never drifts.
//
// The prose preamble is maintained here; the blog links are pulled from the
// same source as the sitemap (`getPublishedPosts`), so publishing a post adds
// it to llms.txt automatically. (Replaces the old hand-maintained
// public/llms.txt — that file was deleted so it can't shadow this route.)

import { getPublishedPosts } from "../../lib/blog";

const BASE_URL = "https://healthos.live";

// One descriptive line per published post. Uses each post's own title so the
// list stays accurate without manual edits.
function postLinks(): string {
  return getPublishedPosts()
    .map((p) => `- ${p.title}: ${BASE_URL}/blog/${p.slug}`)
    .join("\n");
}

function buildLlmsTxt(): string {
  return `# HealthOS

> HealthOS is a voice-first, on-device iOS app that reads your nervous-system state from how you sound — not what you say. A daily voice check-in takes just a few seconds (anywhere from ~3-5 seconds up to 30) of unscripted speech and surfaces eight signals, so you catch shifts in stress, energy, and fatigue before you consciously feel them.

## What it is

- **Product:** HealthOS — a voice biomarker wellness app for iPhone (iOS).
- **Website:** ${BASE_URL}
- **Core idea:** Your voice is the biomarker that speaks first. HealthOS reads *how* you sound (acoustic features like pitch, loudness, pace, pauses, vocal clarity), not the words you say.
- **Privacy:** All analysis runs entirely on-device. Voice audio never leaves the phone and is never uploaded to the cloud.
- **Status:** Pre-launch, free during beta (TestFlight). iPhone first.

## The eight signals

Energy, Stress, Confidence, Fatigue, Vocal Strain, Expressiveness, Articulation, and Breathing. Each is a transparent, literature-grounded formula scored against the user's own ~30-day rolling baseline (a relative "higher/lower than your usual" read, not a clinical or population score).

## How it works

Each signal is a deterministic, peer-reviewed-literature-grounded blend of acoustic features compared to the user's personal baseline. It is not a black-box model. The read is relative and for self-awareness — it does not diagnose or treat, and makes no clinical claims (positioned as a general wellness product).

## How it's different from wearables

Wearables (Oura, WHOOP, Apple Watch) track physiology — heart rate, HRV, sleep — and infer stress. HealthOS reads psychological and nervous-system state (confidence, vocal strain, expressiveness) that a wrist sensor cannot detect. No hardware to wear; it complements a wearable rather than replacing it. "Wearables read your body. Your voice reveals your mind."

## Who it's for

Biohackers and self-trackers, performance-minded professionals, and anyone who wants the "mind" layer their wearable can't read.

## Key facts

- Founder: Sabber Ahamed (Applied ML Scientist), Dallas, TX.
- Category: voice biomarker app, mental-wellness monitoring, biometric self-tracking.
- Pricing: free during beta; pricing after beta not yet public.
- Not a medical device; for self-awareness and general wellness only.

## Links

- Website: ${BASE_URL}
- FAQ: ${BASE_URL}/faq
- What is a voice biomarker (explainer): ${BASE_URL}/voice-biomarkers
- Voice biomarkers vs wearables (Oura/WHOOP/Apple Watch): ${BASE_URL}/voice-vs-wearables
- Blog: ${BASE_URL}/blog

## Blog posts

${postLinks()}

## Contact

- About the founder: ${BASE_URL}/about
- TestFlight beta: https://testflight.apple.com/join/JBG3ANFF
- Discord community: https://discord.gg/SyZPw3cgG
`;
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
