import Nav from "./components/Nav";
import WaitlistForm from "./components/WaitlistForm";
import Logo from "./components/Logo";
import PhoneFrame from "./components/PhoneFrame";
import LazyVideo from "./components/LazyVideo";
import Link from "next/link";

const TEAL = "#0F766E";
const TEAL_LIGHT = "#F0FDFA";
const AMBER = "#F59E0B";

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

const mediaFill: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const trendsScreen = (
  <div className="h-full flex flex-col bg-white">
    <div className="pt-2.5 pb-1 px-3.5 flex items-center justify-between text-[9px] font-semibold text-slate-700">
      <span>5:42</span>
      <span>•••</span>
    </div>
    <div className="px-3.5 pt-2 pb-3 flex items-center gap-1.5">
      <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M15 18l-6-6 6-6"
          stroke="#0F172A"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[13px] font-bold text-slate-900">Trends</span>
    </div>
    <div className="px-3 flex-1 flex flex-col gap-2">
      <div
        className="rounded-xl p-2.5"
        style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
      >
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">
            Back pain
          </span>
          <span className="text-[8px] font-semibold" style={{ color: AMBER }}>
            Last 4 weeks
          </span>
        </div>
        <svg viewBox="0 0 168 52" className="w-full" aria-hidden>
          {Array.from({ length: 4 }).flatMap((_, w) =>
            [38, 34, 36, 32, 22, 10, 8].map((h, d) => {
              const i = w * 7 + d;
              return (
                <rect
                  key={i}
                  x={i * 6 + 1}
                  y={48 - h}
                  width={4}
                  height={h}
                  rx={1}
                  fill={d < 5 ? AMBER : "#CBD5E1"}
                  opacity={d < 5 ? 0.9 : 0.6}
                />
              );
            })
          )}
        </svg>
      </div>
      <div
        className="rounded-xl p-2.5"
        style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
      >
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">
            Sleep
          </span>
          <span className="text-[10px] font-bold text-slate-800">7.2h avg</span>
        </div>
        <svg viewBox="0 0 100 22" className="w-full" aria-hidden>
          <polyline
            points="0,17 10,14 20,16 30,11 40,13 50,9 60,10 70,7 80,8 90,5 100,6"
            stroke={TEAL}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        className="rounded-xl p-2 flex items-start gap-1.5 mb-3"
        style={{ background: `${AMBER}14`, border: `1px solid ${AMBER}40` }}
      >
        <span className="text-[11px] leading-none mt-0.5" aria-hidden>
          💡
        </span>
        <span className="text-[9px] leading-snug text-slate-700">
          <span className="font-semibold">Pattern spotted.</span> Heavier Mon–Thu. Worth checking the chair.
        </span>
      </div>
    </div>
  </div>
);

const showcase = [
  {
    title: "Say it the way you'd text a friend.",
    body: "“I have low back pain right now.” “Slept badly last night.” Speak when something’s off — your agent catches the moment and tags what matters.",
    media: (
      <LazyVideo
        sources={[
          { src: "/screen-listening.webm", type: "video/webm" },
          { src: "/screen-listening.mp4", type: "video/mp4" },
        ]}
        poster="/screen-listening-poster.webp"
        style={mediaFill}
        ariaLabel="HealthOS voice listening screen capturing 'I have low back pain right now'"
      />
    ),
    accent: "amber" as const,
  },
  {
    title: "The agent understands what you said.",
    body: "No categories, no tags — it builds context from your words so patterns can surface on their own.",
    media: (
      <img
        src="/screen-records.webp"
        alt="Health Data screen with categorized records: Medications, Diagnoses, Allergies, Daily Observations, All Records"
        loading="lazy"
        decoding="async"
        width={600}
        height={1300}
        style={mediaFill}
      />
    ),
  },
  {
    title: "Patterns become obvious.",
    body: "Voice logs roll up into trends across days and weeks. The agent surfaces what’s drifting — before it’s a flare-up.",
    media: trendsScreen,
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
              Speak when something feels off — three seconds is enough. The agent reads your week and the world outside, and tells you what&apos;s shifting before you&apos;d think to look.
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
            <div className="flex flex-col items-center gap-1.5 mt-4 text-center">
              <p className="text-sm text-white/65">
                Just your voice — no wearable, no app to integrate, no forms.
              </p>
              <p className="text-sm text-white/55">
                Your health observations never leave your device.
              </p>
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
                {" "}&ldquo;slept badly&rdquo; to &ldquo;left knee acting up.&rdquo; It maps what you say against what&apos;s happening outside — air pressure, pollen, air quality — and the rhythm of your week. The agent tells you what it found — before you thought to ask.
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

          </div>
        </section>

        {/* Showcase — three beats of the actual product */}
        <section id="features" className="py-20 md:py-28" style={{ backgroundColor: TEAL_LIGHT }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14 md:mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-[1.1] mb-4">
                As simple as talking to a friend.
              </h2>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                No setup. No forms. Just speak — your agent listens, organizes, and turns it into trends you can act on.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 items-start justify-items-center">
              {showcase.map((s) => {
                const isAgent = "accent" in s && s.accent === "amber";
                return (
                  <div key={s.title} className="flex flex-col items-center text-center">
                    <div className="relative mb-7">
                      {isAgent && (
                        <div
                          aria-hidden
                          className="absolute pointer-events-none"
                          style={{
                            inset: -24,
                            background: `radial-gradient(circle, ${AMBER}33 0%, transparent 65%)`,
                            filter: "blur(20px)",
                          }}
                        />
                      )}
                      <PhoneFrame width={200} tone="light" style={{ position: "relative" }}>
                        {s.media}
                      </PhoneFrame>
                    </div>
                    <h3 className="font-bold text-lg md:text-xl text-slate-900 mb-2.5 leading-snug max-w-[260px]">
                      {s.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-[280px]">
                      {s.body}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-16">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: TEAL }}
              >
                How privacy works, in detail
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
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
