"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type Source = { src: string; type: string };

type Props = {
  sources: Source[];
  poster?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
};

export default function LazyVideo({ sources, poster, className, style, ariaLabel }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
      style={style}
      aria-label={ariaLabel}
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}
