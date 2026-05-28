import Nav from "./components/Nav";
import WaitlistForm from "./components/WaitlistForm";
import Logo from "./components/Logo";
import Link from "next/link";

const TEAL = "#0F766E";
const TEAL_DARK = "#0D5F58";
const TEAL_LIGHT = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";
const AMBER = "#F59E0B";
const AMBER_SOFT = "#FEF3C7";
const AMBER_BORDER = "#FCD34D";

const patterns = [
  {
    label: "Recurring pattern",
    title: "Your back pain has a work week.",
    body: "Heavy Monday through Thursday. Quiet on weekends. The agent connected your week to the chair before you did.",
    visual: (
      <svg viewBox="0 0 200 100" width="100%" height="100%" aria-hidden>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <text
            key={i}
            x={52 + i * 16}
            y={9}
            textAnchor="middle"
            fontSize="7"
            fontWeight={i < 5 ? 600 : 400}
            fill={i < 5 ? "#475569" : "#94A3B8"}
          >
            {d}
          </text>
        ))}
        {([
          [3, 2, 3, 2, 1, 0, 0],
          [2, 3, 2, 3, 2, 1, 0],
          [3, 3, 3, 2, 1, 0, 0],
          [2, 3, 3, 3, 2, 0, 1],
          [3, 2, 3, 3, 1, 0, 0],
        ] as number[][]).flatMap((row, w) =>
          row.map((val, d) => (
            <rect
              key={`${w}-${d}`}
              x={45 + d * 16}
              y={14 + w * 14}
              width={14}
              height={12}
              rx={2}
              fill={["#F8FAFC", "#FEF3C7", "#FCD34D", "#F59E0B"][val]}
              stroke="#F1F5F9"
              strokeWidth={0.5}
            />
          ))
        )}
        <text x={184} y={94} textAnchor="end" fontSize="7" fill="#94A3B8">last 5 weeks</text>
      </svg>
    ),
  },
  {
    label: "Hidden trigger",
    title: "Pressure drops. Migraine comes.",
    body: "Most people blame the weather. The agent shows you the storm front a day ahead — and tells you to take it slow.",
    visual: (
      <svg viewBox="0 0 200 100" width="100%" height="100%" aria-hidden>
        <line x1="16" y1="20" x2="184" y2="20" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="16" y1="50" x2="184" y2="50" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="16" y1="80" x2="184" y2="80" stroke="#E2E8F0" strokeWidth="1" />
        <polyline
          points="16,38 29,32 42,38 55,50 68,68 81,56 94,44 107,38 120,32 133,38 146,56 159,68 172,56 184,44"
          stroke="#0F766E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="68" cy="68" r="7" fill="#F59E0B" opacity="0.18" />
        <circle cx="68" cy="68" r="3.5" fill="#F59E0B" />
        <circle cx="159" cy="68" r="7" fill="#F59E0B" opacity="0.18" />
        <circle cx="159" cy="68" r="3.5" fill="#F59E0B" />
        <line x1="105" y1="90" x2="115" y2="90" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
        <text x="118" y="93" fontSize="7" fill="#94A3B8">pressure</text>
        <circle cx="148" cy="90" r="2.5" fill="#F59E0B" />
        <text x="153" y="93" fontSize="7" fill="#94A3B8">migraine</text>
      </svg>
    ),
  },
  {
    label: "Triggers",
    title: "Low sleep, harder day after.",
    body: "Two clusters. One answer. The agent draws the line from your daily entries — no spreadsheets needed.",
    visual: (
      <svg viewBox="0 0 200 100" width="100%" height="100%" aria-hidden>
        <line x1="24" y1="10" x2="24" y2="78" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="24" y1="78" x2="184" y2="78" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="24" y1="72" x2="184" y2="14" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        {[
          [40, 64], [54, 58], [32, 62], [62, 52], [50, 66],
          [70, 50], [44, 70], [58, 60], [78, 46],
        ].map(([cx, cy], i) => (
          <circle key={`bad-${i}`} cx={cx} cy={cy} r={3.2} fill="#F59E0B" opacity={0.88} />
        ))}
        {[
          [132, 28], [148, 22], [120, 32], [160, 18], [144, 26],
          [136, 22], [156, 22], [128, 26], [168, 16],
        ].map(([cx, cy], i) => (
          <circle key={`good-${i}`} cx={cx} cy={cy} r={3.2} fill="#0F766E" opacity={0.88} />
        ))}
        {[
          [92, 42], [104, 38], [98, 46],
        ].map(([cx, cy], i) => (
          <circle key={`mid-${i}`} cx={cx} cy={cy} r={2.8} fill="#94A3B8" opacity={0.6} />
        ))}
        <text x="104" y="93" textAnchor="middle" fontSize="7" fill="#94A3B8">hours of sleep</text>
        <text x="13" y="46" fontSize="7" fill="#94A3B8" transform="rotate(-90 13 46)">energy</text>
      </svg>
    ),
  },
  {
    label: "Anomaly",
    title: "Something's shifting. Worth a look.",
    body: "Your baseline drifts. The agent quietly flags it — before it's a flare-up, a setback, or a thing.",
    visual: (
      <svg viewBox="0 0 200 100" width="100%" height="100%" aria-hidden>
        <rect x="16" y="42" width="168" height="22" fill="#F1F5F9" />
        <line x1="16" y1="42" x2="184" y2="42" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="16" y1="64" x2="184" y2="64" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
        <text x="180" y="54" textAnchor="end" fontSize="7" fill="#94A3B8">normal</text>
        <polyline
          points="16,55 28,50 40,53 52,56 64,49 76,52 88,50 100,53 112,47"
          stroke="#64748B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="112,47 124,40 136,33 148,26 160,20 172,14"
          stroke="#F59E0B"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="172" cy="14" r="6" fill="#F59E0B" opacity="0.22" />
        <circle cx="172" cy="14" r="3.2" fill="#F59E0B" />
        <rect x="120" y="3" width="58" height="13" rx="6.5" fill="#FEF3C7" />
        <text x="149" y="12" textAnchor="middle" fontSize="8" fontWeight="600" fill="#92400E">2.3× baseline</text>
        <text x="16" y="94" fontSize="7" fill="#94A3B8">last 14 days</text>
      </svg>
    ),
  },
];

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Just Talk",
    desc: "\"I took ibuprofen this morning\" or \"my knee has been sore for two days\" — speak naturally and it understands, remembers, and organises everything.",
    accent: "amber" as const,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Or Type a Quick Note",
    desc: "Jot down a symptom, a question, or a reminder in seconds. No forms, no categories — just write it the way you'd text a friend.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    title: "Or Snap a Photo",
    desc: "Point your camera at a prescription, a nutrition label, or anything health-related. Your agent reads it and folds it into your personal context automatically.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "On‑Device AI Agent",
    desc: "A powerful AI model runs locally on your phone — no server, no subscription, no cloud. It understands your full context and gets smarter the more you share.",
    accent: "amber" as const,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Ask Anything",
    desc: "\"What medications am I on?\" \"Have I been sleeping worse lately?\" Get plain-language answers drawn from everything you've shared — not generic internet advice.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Trends Over Time",
    desc: "Track how you feel across days, weeks, and months. Spot patterns — in sleep, energy, pain, or mood — before they become bigger problems.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden" style={{ backgroundColor: TEAL }}>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Amber glow — signals the agent is "alive" in the hero */}
          <div
            className="absolute pointer-events-none"
            aria-hidden
            style={{
              top: "30%",
              left: "50%",
              width: "520px",
              height: "520px",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${AMBER}33 0%, transparent 60%)`,
              filter: "blur(40px)",
            }}
          />
          <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 flex flex-col items-center text-center gap-6">
            <Logo size={80} pulse tone="on-dark" style={{ marginBottom: 8, boxShadow: "0 12px 32px rgba(0,0,0,0.18)", borderRadius: 18 }} />
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${AMBER}26`, color: "#FEF3C7", border: `1px solid ${AMBER}66` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AMBER, animation: "pulse-listening 2s ease-in-out infinite" }} />
              Voice agent · on-device
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.12] tracking-tight max-w-3xl">
              Your on‑device health agent<br />
              <span className="text-white/75 font-semibold">spots patterns before they get bad.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              A voice-first on-device agent that turns your daily observations into patterns you can act on.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a
                href="#waitlist"
                className="px-7 py-3.5 rounded-xl bg-white font-semibold text-sm shadow-lg hover:bg-white/90 transition-all"
                style={{ color: TEAL }}
              >
                Join the Waitlist
              </a>
              <a
                href="#why"
                className="px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                Learn more
              </a>
            </div>
          </div>
        </section>

        {/* Patterns — what your agent shows you */}
        <section id="why" className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">

            <div className="mb-12 md:mb-14 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-[1.1] mb-5">
                Catch the patterns before they get bad.
              </h2>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                A simple voice agent on your phone. Speak when something&apos;s off — anything from
                {" "}&ldquo;slept badly&rdquo; to &ldquo;left knee acting up.&rdquo; It maps what you say against your sleep,
                the air outside, your week. The patterns appear.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {patterns.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl p-5 md:p-6 bg-slate-50 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="mb-5 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm">
                    <div className="aspect-[2/1]">{p.visual}</div>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: AMBER }}>
                    {p.label}
                  </p>
                  <h3 className="font-bold text-lg md:text-xl text-slate-900 mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-slate-500 text-base md:text-lg leading-relaxed mt-12 max-w-2xl">
              All of it runs on the phone in your pocket. None of it leaves the device.
            </p>

          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28" style={{ backgroundColor: TEAL_LIGHT }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                As simple as talking to a friend
              </h2>
              <p className="text-slate-500 text-lg max-w-lg mx-auto">
                No setup. No imports. No forms. Just share what's on your mind and your agent handles the rest.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => {
                const isAgent = "accent" in f && f.accent === "amber";
                return (
                  <div
                    key={f.title}
                    className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderColor: isAgent ? AMBER_BORDER : TEAL_BORDER }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: isAgent ? AMBER_SOFT : TEAL_LIGHT,
                        color: isAgent ? AMBER : TEAL,
                      }}
                    >
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy callout */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: TEAL_LIGHT, color: TEAL }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Your data never leaves your phone</h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-6">
              Runs entirely on your device. No account needed, no cloud sync,
              no third parties. Everything you share with your agent stays between you and your phone.
            </p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: TEAL }}
            >
              Read our Privacy Policy
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="relative py-20 md:py-28 overflow-hidden" style={{ backgroundColor: TEAL }}>
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative max-w-lg mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Get early access
              </h2>
              <p className="text-white/70 text-lg">
                Early access is limited. Drop your email and we'll reach out when your spot is ready.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <WaitlistForm />
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-medium text-slate-700">HealthOS</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Use</Link>
            <a href="mailto:sabber@healthos.live" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} HealthOS</p>
        </div>
      </footer>
    </>
  );
}
