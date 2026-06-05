"use client";

// One voice snippet in the "Hear real logs" row. Click to play.
// Real audio is optional — if `src` is set and the file exists, the
// <audio> plays. Otherwise the card just animates a fake waveform so
// the page still has motion before real audio is dropped in.
//
// To wire real audio later: drop the file in public/audio/ and pass
// `src="/audio/surgeon-preop.mp3"` (or whatever you record).

import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  duration: string;
  /** Optional audio file path. Leave undefined until you have one. */
  src?: string;
};

const BAR_COUNT = 26;

export default function VoiceSnippet({ label, duration, src }: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build a static waveform so each snippet has its own silhouette.
  // Heights are deterministic per index — gives every card a unique
  // shape without any animation jitter on hydration.
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const env = Math.sin((i / BAR_COUNT) * Math.PI); // fade ends
    const seed = Math.abs(Math.sin(i * 1.7 + label.length * 0.5));
    return 4 + Math.round(env * (10 + seed * 22));
  });

  // Pause this snippet if a different snippet starts. Listen via a
  // page-level custom event so we don't need shared state.
  useEffect(() => {
    const onOther = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      if (detail.id !== label && playing) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    window.addEventListener("snippet:play", onOther);
    return () => window.removeEventListener("snippet:play", onOther);
  }, [label, playing]);

  const onClick = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    window.dispatchEvent(
      new CustomEvent("snippet:play", { detail: { id: label } }),
    );
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // No audio yet — just keep the visual playing state on for
        // the configured duration so the user gets feedback.
        const seconds = parseInt(duration.split(":")[1] || "8", 10);
        setTimeout(() => setPlaying(false), seconds * 1000);
      });
    } else {
      const seconds = parseInt(duration.split(":")[1] || "8", 10);
      setTimeout(() => setPlaying(false), seconds * 1000);
    }
    setPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`snip${playing ? " playing" : ""}`}
      style={{
        flex: "1 1 280px",
        maxWidth: 360,
        display: "flex",
        alignItems: "center",
        gap: 15,
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "16px 18px",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "border-color .2s, box-shadow .2s, transform .2s",
      }}
    >
      <span
        className="snip-play"
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: playing ? "var(--amber)" : "var(--teal)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          transition: "background .2s",
        }}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
            <rect x="6" y="5" width="4" height="14" rx="1.2" />
            <rect x="14" y="5" width="4" height="14" rx="1.2" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        )}
      </span>
      <span
        className="snip-wave"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          height: 36,
          overflow: "hidden",
        }}
      >
        {bars.map((h, i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: h,
              minHeight: 3,
              borderRadius: 3,
              background: playing ? "var(--teal)" : "var(--line-strong)",
              transformOrigin: "center",
              transition: "background .25s",
              animation: playing
                ? `snip-bar .85s ease-in-out ${i * 0.035}s infinite`
                : "none",
            }}
          />
        ))}
      </span>
      <span
        style={{
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        <b
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--ink)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </b>
        <span
          style={{
            fontSize: 12.5,
            color: "var(--ink-soft)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {duration}
        </span>
      </span>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="none"
          onEnded={() => setPlaying(false)}
          onError={() => setPlaying(false)}
        />
      )}
    </button>
  );
}
