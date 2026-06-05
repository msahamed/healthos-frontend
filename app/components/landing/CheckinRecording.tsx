"use client";

// "See it in action" — phone-framed video player. Drop the real screen
// recording at /public/landing/checkin.mp4 (any size; H.264 best). The
// component plays it on tap; gracefully falls back to a button bounce
// if the file isn't there yet.

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  /** Path under /public — defaults to /landing/checkin.mp4. */
  src?: string;
  /** Poster image while paused. */
  poster?: string;
};

export default function CheckinRecording({
  src = "/landing/checkin.mp4",
  poster = "/screenshots/talk-smaller.png",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const onPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video
      .play()
      .then(() => {
        video.setAttribute("controls", "");
        setPlaying(true);
      })
      .catch(() => {
        // No video yet — bounce the button so the user gets feedback.
        const btn = (event?.currentTarget as HTMLElement | undefined) ??
          document.querySelector(".rec-play .pbtn");
        if (btn) {
          (btn as HTMLElement).style.transform = "scale(0.92)";
          setTimeout(() => {
            (btn as HTMLElement).style.transform = "";
          }, 150);
        }
      });
  };

  return (
    <div className="rec-stage" style={{ display: "flex", justifyContent: "center" }}>
      <div
        className="rec-phone"
        style={{
          width: 320,
          height: 660,
          borderRadius: 46,
          background: "#0a0a0a",
          position: "relative",
          flexShrink: 0,
          boxShadow:
            "0 50px 90px rgba(0,0,0,.45), inset 0 0 0 1.5px rgba(255,255,255,.06)",
        }}
      >
        <div
          className="rec-island"
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 29,
            borderRadius: 18,
            background: "#000",
            zIndex: 5,
          }}
        />
        <div
          className="rec-screen"
          style={{
            position: "absolute",
            inset: 5,
            borderRadius: 41,
            overflow: "hidden",
            background: "#EAEFF1",
          }}
        >
          {!playing && (
            <Image
              src={poster}
              alt="A day of voice check-ins in HealthOS"
              fill
              style={{ objectFit: "cover", objectPosition: "top center" }}
              sizes="320px"
              priority={false}
            />
          )}
          <video
            ref={videoRef}
            poster={poster}
            playsInline
            preload="none"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              display: playing ? "block" : "none",
            }}
          >
            <source src={src} type="video/mp4" />
          </video>
        </div>

        {!playing && (
          <button
            type="button"
            className="rec-play"
            aria-label="Play check-in recording"
            onClick={onPlay}
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              zIndex: 4,
              cursor: "pointer",
              background:
                "radial-gradient(circle at 50% 46%, rgba(10,18,20,.18), rgba(10,18,20,.34))",
              transition: "background .2s",
              border: "none",
              borderRadius: 46,
            }}
          >
            <span
              className="pbtn"
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "rgba(255,255,255,.92)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 12px 34px rgba(0,0,0,.3)",
                transition: "transform .2s",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="#14272C"
              >
                <path d="M7 4.5v15l13-7.5-13-7.5z" />
              </svg>
            </span>
          </button>
        )}

        {!playing && (
          <>
            <div
              className="rec-cap"
              style={{
                position: "absolute",
                bottom: 70,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 4,
                fontSize: 12.5,
                fontWeight: 600,
                color: "#fff",
                background: "rgba(10,18,20,.55)",
                backdropFilter: "blur(6px)",
                padding: "6px 14px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              Real check-in · 0:30
            </div>
            <div
              className="rec-eq"
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 30,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 4,
                height: 30,
                zIndex: 4,
              }}
            >
              {[0, 0.12, 0.24, 0.08, 0.3, 0.16, 0.04].map((d, i) => (
                <span
                  key={i}
                  style={{
                    width: 4,
                    borderRadius: 3,
                    background: "var(--amber)",
                    animation: `eq 1s ease-in-out ${d}s infinite`,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
