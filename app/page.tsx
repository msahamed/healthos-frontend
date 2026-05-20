import Nav from "./components/Nav";
import WaitlistForm from "./components/WaitlistForm";
import Link from "next/link";

const TEAL = "#0F766E";
const TEAL_LIGHT = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const painPoints = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    headline: "Health apps expose your most sensitive data",
    body: "Every symptom you log, every question you ask — most apps upload it to remote servers where it can be breached, shared, or subpoenaed. Your agent runs entirely on your device. Nothing ever leaves your phone.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M8.111 16.404a5.5 5.5 0 017.778 0M6.343 14.636a8 8 0 0111.314 0M4.929 12.929a10 10 0 0114.142 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    headline: "Critical moments don't have Wi‑Fi",
    body: "Emergencies, hospital basements, flights — you need your health context precisely when there's no signal. Your agent works fully offline, always.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: "Tracking your health shouldn't be a chore",
    body: "Most health apps demand structured input — forms, fields, categories. Your agent gets out of the way. Just talk, type a quick note, or snap a photo. Done.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    headline: "You deserve straight answers about your health",
    body: "\"Is this normal?\" \"Am I due for a refill?\" Your agent knows your full context and answers in plain language — like a knowledgeable friend who's always available.",
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
          <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center mb-2 shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Your private health agent,<br />
              <span className="text-white/75">always on‑device</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed">
              Talk to it, text it, or show it a photo — a personal AI agent
              that understands your health context and keeps it entirely on your phone.
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
            <p className="text-white/45 text-sm mt-1">Free · No account required · iOS 16+</p>
          </div>
        </section>

        {/* Pain Points */}
        <section id="why" className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Why your health agent belongs on‑device
              </h2>
              <p className="text-slate-500 text-lg max-w-lg mx-auto">
                Privacy isn't a feature — it's the foundation. Here's what's broken with every other approach.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {painPoints.map((p) => (
                <div key={p.headline} className="flex gap-4 p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: TEAL_LIGHT, color: TEAL }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1.5">{p.headline}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
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
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderColor: TEAL_BORDER }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: TEAL_LIGHT, color: TEAL }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
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
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: TEAL }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
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
