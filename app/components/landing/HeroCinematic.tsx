"use client";

// Hero cinematic — a 4-beat scripted loop that walks one performer's
// check-in from voice to pattern.
//
//   Speak    — Zuri "listening", transcript types in
//   Hear     — same transcript with the 3 hero signals revealed
//   Log      — the check-in lands in Today's feed
//   Pattern  — Zuri's pattern surfaces ("strain climbs by the third
//              show — before you can hear it")
//
// Tap the phone to pause/resume. Replay button restarts from beat 1.

import { useEffect, useState } from "react";

const CINE = {
  transcript:
    "Yeah, good. Just wrapped the call. Think it went well. Few more today and I'm done.",
  signals: [
    { label: "Vocal strain", val: "High", dir: "up", tone: "amber" },
    { label: "Energy", val: "Low", dir: "down", tone: "muted" },
    { label: "Confidence", val: "Holding", dir: "flat", tone: "muted" },
  ] as const,
  moreSignals: 6,
  pattern:
    "Your vocal strain climbs by your third call — before you can hear it.",
};

type Scene = {
  id: "speak" | "hear" | "log" | "pattern";
  ms: number;
  cap: string;
};

const SCENES: Scene[] = [
  { id: "speak", ms: 4200, cap: "It starts with a few honest seconds." },
  {
    id: "hear",
    ms: 3800,
    cap: "Zuri reads nine signals in how you sound — not the words.",
  },
  { id: "log", ms: 3600, cap: "Each one becomes a check-in you can read." },
  {
    id: "pattern",
    ms: 5200,
    cap: "Then a pattern surfaces — before it can cost you.",
  },
];

export default function HeroCinematic() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!playing) return;
    // All setState calls go through timeouts so none happen
    // synchronously inside the effect body (React 19 lint).
    const t0 = setTimeout(() => setFade(false), 0);
    const t1 = setTimeout(() => setFade(true), 30);
    const t2 = setTimeout(
      () => setStep((s) => (s + 1) % SCENES.length),
      SCENES[step].ms,
    );
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, playing]);

  const scene = SCENES[step];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* progress segments */}
      <div
        style={{
          display: "flex",
          gap: 6,
          width: 300,
          marginBottom: 14,
        }}
      >
        {SCENES.map((s, i) => (
          <div
            key={s.id}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: "rgba(255,255,255,.16)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: "#FCD34D",
                width: i <= step ? "100%" : "0%",
                transition:
                  i === step && playing
                    ? `width ${scene.ms}ms linear`
                    : "none",
                transformOrigin: "left",
              }}
            />
          </div>
        ))}
      </div>

      {/* phone */}
      <div
        onClick={() => setPlaying((p) => !p)}
        style={{
          width: 320,
          height: 624,
          borderRadius: 46,
          background: "#0b0b0c",
          padding: 9,
          boxShadow:
            "0 50px 90px rgba(0,0,0,.5), inset 0 0 0 1.5px rgba(255,255,255,.05)",
          cursor: "pointer",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 38,
            overflow: "hidden",
            background: "#fff",
            position: "relative",
          }}
        >
          {/* dynamic island */}
          <span
            style={{
              position: "absolute",
              top: 11,
              left: "50%",
              transform: "translateX(-50%)",
              width: 104,
              height: 28,
              background: "#000",
              borderRadius: 16,
              zIndex: 40,
            }}
          />
          {/* status bar */}
          <div
            style={{
              height: 46,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: "0 26px 6px",
            }}
          >
            <span
              style={{ fontSize: 14, fontWeight: 650, color: "#1B2430" }}
            >
              9:41
            </span>
            <svg width="22" height="11" viewBox="0 0 24 11">
              <rect
                x="0.5"
                y="0.5"
                width="20"
                height="10"
                rx="3"
                stroke="#1B2430"
                strokeOpacity=".35"
                fill="none"
              />
              <rect
                x="2"
                y="2"
                width="16"
                height="7"
                rx="1.6"
                fill="#1B2430"
              />
            </svg>
          </div>
          {/* scene canvas */}
          <div
            key={step}
            style={{
              position: "absolute",
              top: 46,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: fade ? 1 : 0,
              transition: "opacity .45s ease",
            }}
          >
            {scene.id === "speak" && <SceneSpeak active={fade && playing} />}
            {scene.id === "hear" && <SceneHear active={fade && playing} />}
            {scene.id === "log" && <SceneLog active={fade && playing} />}
            {scene.id === "pattern" && (
              <ScenePattern active={fade && playing} />
            )}
          </div>
        </div>
        {/* paused overlay */}
        {!playing && (
          <div
            style={{
              position: "absolute",
              inset: 9,
              borderRadius: 38,
              display: "grid",
              placeItems: "center",
              background: "rgba(15,20,18,.32)",
              zIndex: 50,
            }}
          >
            <span
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "rgba(255,255,255,.92)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,.3)",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#14201E"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* caption + replay */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          minHeight: 56,
        }}
      >
        <div
          key={`cap${step}`}
          style={{
            fontSize: 15.5,
            fontWeight: 500,
            color: "#DCE5E2",
            textAlign: "center",
            maxWidth: 340,
            animation: "cine-cap .5s ease",
          }}
        >
          {scene.cap}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStep(0);
            setPlaying(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#C9D4D2",
            cursor: "pointer",
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.14)",
            borderRadius: 999,
            padding: "6px 13px",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 4v4h4" />
          </svg>
          Replay
        </button>
      </div>
    </div>
  );
}

// ─── Scene 1: Speak ──────────────────────────────────────────────────────

function SceneSpeak({ active }: { active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    // Reset + (re)start happen via a microtask so neither setState
    // call is synchronous inside the effect body (React 19 lint).
    const reset = setTimeout(() => setN(0), 0);
    if (!active) return () => clearTimeout(reset);
    const id = setInterval(
      () => setN((v) => Math.min(CINE.transcript.length, v + 1)),
      42,
    );
    return () => {
      clearTimeout(reset);
      clearInterval(id);
    };
  }, [active]);
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 26px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 92,
          height: 92,
          display: "grid",
          placeItems: "center",
          marginBottom: 22,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "#FEF3C7",
            animation: "cine-pulse 1.9s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            background: "#FCD34D",
            opacity: 0.5,
            animation: "cine-pulse 1.9s ease-in-out .3s infinite",
          }}
        />
        <span
          style={{
            position: "relative",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#F59E0B",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 26px rgba(245,158,11,.45)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </span>
      </div>
      <div style={{ height: 32, marginBottom: 16 }}>
        <Cwave active={active} />
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#F59E0B",
          marginBottom: 14,
        }}
      >
        Listening…
      </div>
      <div
        style={{
          fontFamily: "var(--font-newsreader), Georgia, serif",
          fontSize: 19,
          lineHeight: 1.4,
          color: "#1B2430",
          minHeight: 80,
          fontStyle: "italic",
        }}
      >
        &ldquo;{CINE.transcript.slice(0, n)}
        <span
          style={{
            borderRight: "2px solid #F59E0B",
            marginLeft: 1,
            opacity: n < CINE.transcript.length ? 1 : 0,
            animation: "cine-caret 1s step-end infinite",
          }}
        />
        &rdquo;
      </div>
    </div>
  );
}

// ─── Scene 2: Hear ───────────────────────────────────────────────────────

function SceneHear({ active }: { active: boolean }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#F59E0B",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 3l1.6 4.8L18.4 9l-4.8 1.6L12 15l-1.6-4.4L5.6 9l4.8-1.2L12 3z" />
          </svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#8A6A33" }}>
          Reading how you sound…
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-newsreader), Georgia, serif",
          fontSize: 16.5,
          fontStyle: "italic",
          lineHeight: 1.45,
          color: "#46505E",
          marginBottom: 22,
          position: "relative",
        }}
      >
        &ldquo;{CINE.transcript}&rdquo;
        <span
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, transparent 30%, rgba(245,158,11,.18) 50%, transparent 70%)",
            backgroundSize: "220% 100%",
            animation: active
              ? "cine-scan 1.6s ease-in-out infinite"
              : "none",
            borderRadius: 6,
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 9 }}
      >
        {CINE.signals.map((s, i) => (
          <SignalChip
            key={s.label}
            s={s}
            show={active}
            delay={0.25 + i * 0.4}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 12.5,
          fontWeight: 600,
          color: "#A0A8B2",
          textAlign: "center",
        }}
      >
        + {CINE.moreSignals} more signals read from your voice
      </div>
    </div>
  );
}

// ─── Scene 3: Log ────────────────────────────────────────────────────────

function SceneLog({ active }: { active: boolean }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "8px 20px 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-newsreader), Georgia, serif",
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: -0.4,
          color: "#1B2430",
        }}
      >
        Today
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "#8A93A0",
          fontWeight: 500,
          marginBottom: 18,
        }}
      >
        Tuesday · 3 check-ins
      </div>

      {/* The new check-in lands at the top */}
      <div
        style={{
          border: "1px solid #E4E9ED",
          borderRadius: 16,
          padding: "14px 15px",
          background: "#fff",
          boxShadow: "0 12px 28px rgba(20,30,40,.08)",
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(-14px)",
          transition:
            "opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "#8A93A0",
              whiteSpace: "nowrap",
            }}
          >
            6:40 PM
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              color: "#0F766E",
              whiteSpace: "nowrap",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0F766E"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 6" />
            </svg>
            Saved
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: 15.5,
            lineHeight: 1.45,
            color: "#2B3038",
            marginBottom: 14,
          }}
        >
          &ldquo;{CINE.transcript}&rdquo;
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {CINE.signals.map((s) => {
            const amber = s.tone === "amber";
            return (
              <span
                key={s.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: amber ? "#B45309" : "#5B6472",
                  background: amber ? "#FEF4E0" : "#F1F4F6",
                  border: `1px solid ${amber ? "#F6D38A" : "#E4E9ED"}`,
                  borderRadius: 999,
                  padding: "4px 9px",
                }}
              >
                <Dir
                  dir={s.dir}
                  c={amber ? "#F59E0B" : "#8A93A0"}
                />
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Faint earlier card to imply a feed */}
      <div
        style={{
          marginTop: 11,
          border: "1px solid #EDF0F2",
          borderRadius: 16,
          padding: "13px 15px",
          background: "#fff",
          opacity: 0.5,
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#A6AEB8",
            marginBottom: 6,
          }}
        >
          2:15 PM
        </div>
        <div
          style={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: 14.5,
            color: "#8A93A0",
            fontStyle: "italic",
          }}
        >
          &ldquo;Warm-ups felt easy earlier, good sign…&rdquo;
        </div>
      </div>
    </div>
  );
}

// ─── Scene 4: Pattern ────────────────────────────────────────────────────

function ScenePattern({ active }: { active: boolean }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "8px 20px 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-newsreader), Georgia, serif",
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: -0.4,
          color: "#1B2430",
        }}
      >
        Patterns
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "#8A93A0",
          fontWeight: 500,
          marginBottom: 18,
        }}
      >
        Something Zuri noticed
      </div>

      <div
        style={{
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(10px)",
          transition:
            "opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 13,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#F59E0B",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="#fff"
            >
              <path d="M12 3l1.6 4.8L18.4 9l-4.8 1.6L12 15l-1.6-4.4L5.6 9l4.8-1.2L12 3z" />
            </svg>
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "#B45309",
            }}
          >
            A pattern Zuri noticed
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontWeight: 500,
            fontSize: 23,
            lineHeight: 1.28,
            letterSpacing: -0.3,
            color: "#1B2430",
          }}
        >
          {CINE.pattern}
        </div>

        {/* cause → effect */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 7,
            marginTop: 18,
          }}
        >
          <span
            style={{
              flex: 1,
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#0B554E",
              background: "#ECF4F2",
              border: "1px solid #CBE2DD",
              borderRadius: 13,
              padding: "13px 6px",
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0F766E"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            Third show
          </span>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "#D8B86A",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </span>
          <span
            style={{
              flex: 1,
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#B45309",
              background: "#FEF4E0",
              border: "1px solid #F6D38A",
              borderRadius: 13,
              padding: "13px 6px",
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h2M8 8v8M12 5v14M16 9v6M21 12h0" />
            </svg>
            Strain rising
          </span>
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          textAlign: "center",
          fontSize: 12.5,
          color: "#8A93A0",
          fontWeight: 600,
        }}
      >
        Heard before each of your last 3 voice-rest days
      </div>
    </div>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────

function Cwave({
  active,
  color = "#FB923C",
  h = 30,
  bars = 13,
}: {
  active: boolean;
  color?: string;
  h?: number;
  bars?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        height: h,
      }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 3,
            borderRadius: 3,
            background: color,
            height: h,
            transformOrigin: "center",
            transform: `scaleY(${0.25 + ((i * 5) % 7) / 9})`,
            animation: active
              ? `cine-wave ${0.6 + (i % 4) * 0.14}s ease-in-out ${i * 0.05}s infinite`
              : "none",
          }}
        />
      ))}
    </span>
  );
}

function Dir({ dir, c }: { dir: "up" | "down" | "flat"; c: string }) {
  if (dir === "flat") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16">
        <path d="M3 8h10" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      style={{ transform: dir === "up" ? "none" : "scaleY(-1)" }}
    >
      <path
        d="M8 13V4M4 8l4-4 4 4"
        stroke={c}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

type SignalShape = {
  label: string;
  val: string;
  dir: "up" | "down" | "flat";
  tone: "amber" | "muted";
};

function SignalChip({
  s,
  show,
  delay,
}: {
  s: SignalShape;
  show: boolean;
  delay: number;
}) {
  const amber = s.tone === "amber";
  const c = amber ? "#B45309" : "#5B6472";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 13px",
        borderRadius: 12,
        background: amber ? "#FEF4E0" : "#F1F4F6",
        border: `1px solid ${amber ? "#F6D38A" : "#E4E9ED"}`,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: `opacity .45s ease ${delay}s, transform .45s ease ${delay}s`,
      }}
    >
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#2B3038" }}>
        {s.label}
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          fontWeight: 700,
          color: c,
        }}
      >
        <Dir dir={s.dir} c={amber ? "#F59E0B" : "#8A93A0"} />
        {s.val}
      </span>
    </div>
  );
}
