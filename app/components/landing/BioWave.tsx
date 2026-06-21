"use client";

import { useEffect, useRef } from "react";

type CharFn = (t: number, x: number) => number;
type Character = { bars: number; amber?: boolean; fn: CharFn };

const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const CHARACTERS: Record<string, Character> = {
  energy: {
    bars: 27,
    fn: (t, x) => 0.34 + 0.62 * Math.abs(Math.sin(t * 5.2 + x * 7.5)),
  },
  fatigue: {
    bars: 27,
    fn: (t, x) =>
      0.1 + (0.62 - 0.42 * x) * (0.55 + 0.45 * Math.sin(t * 1.3 + x * 5.2)),
  },
  stress: {
    amber: true,
    bars: 36,
    fn: (t, x) => 0.22 + 0.7 * rnd(Math.floor(t * 22) * 0.61 + x * 131),
  },
  mood: {
    bars: 27,
    fn: (t, x) => 0.42 + 0.36 * Math.sin(t * 2.1 + x * 6.3),
  },
  "vocal strain": {
    amber: true,
    bars: 30,
    fn: (t, x) =>
      Math.min(
        0.9,
        0.28 +
          0.8 * Math.abs(Math.sin(t * 3.8 + x * 9)) +
          0.16 * rnd(x * 53 + Math.floor(t * 16))
      ),
  },
  "cognitive load": {
    bars: 36,
    fn: (t, x) =>
      0.34 +
      0.28 * Math.sin(t * 3.1 + x * 13) +
      0.24 * Math.sin(t * 7.4 + x * 29),
  },
  confidence: {
    bars: 24,
    fn: (t, x) => 0.55 + 0.13 * Math.sin(t * 2.4 + x * 4.2),
  },
  "social engagement": {
    bars: 32,
    fn: (t, x) =>
      (Math.sin(t * 1.9 + Math.floor(x * 5) * 1.7) > -0.1 ? 1 : 0.22) *
      (0.34 + 0.44 * Math.abs(Math.sin(t * 5.5 + x * 19))),
  },
  "future orientation": {
    bars: 27,
    fn: (t, x) =>
      (0.18 + 0.72 * x) * (0.6 + 0.4 * Math.sin(t * 2.8 + x * 8)),
  },
  expressiveness: {
    bars: 30,
    fn: (t, x) =>
      0.28 +
      0.6 * Math.abs(Math.sin(t * 4.1 + x * 10)) *
        (0.55 + 0.45 * Math.sin(t * 1.7 + x * 3)),
  },
  articulation: {
    bars: 34,
    fn: (t, x) =>
      0.24 + 0.66 * rnd(Math.floor(t * 11) * 0.5 + x * 71),
  },
  breathing: {
    bars: 27,
    fn: (t, x) => 0.26 + 0.5 * Math.abs(Math.sin(t * 1.1 + x * 3.1)),
  },
};

const TEAL = "#0F766E";
const TEAL_SOFT = "#9CC4BF";
const AMBER = "#F59E0B";

export default function BioWave({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const card = cv.closest(".bio") as HTMLElement | null;
    if (!card) return;

    const ch = CHARACTERS[name.trim().toLowerCase()];
    if (!ch) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    const size = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number, live: boolean) => {
      if (!w) size();
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const n = ch.bars;
      const bw = 3;
      const gap = (w - n * bw) / (n - 1);
      const mid = h / 2;
      const scan = (t * 0.42) % 1.25;
      for (let i = 0; i < n; i++) {
        const x = i / (n - 1);
        const amp = live
          ? Math.max(0.06, Math.min(1, ch.fn(t, x)))
          : 0.16 + 0.1 * Math.abs(Math.sin(x * 9));
        const bh = Math.max(2.5, amp * h * 0.92);
        const hot = live && ch.amber && amp > 0.72;
        const nearScan = live ? Math.max(0, 1 - Math.abs(x - scan) * 9) : 0;
        const fill = live ? (hot ? AMBER : TEAL) : TEAL_SOFT;
        ctx.globalAlpha = live ? 0.78 + 0.22 * nearScan : 1;
        ctx.fillStyle = fill;
        const pxPos = i * (bw + gap);
        const r = 1.5;
        const lift = nearScan * 2.5;
        ctx.beginPath();
        const rect = ctx as CanvasRenderingContext2D & {
          roundRect?: (
            x: number,
            y: number,
            w: number,
            h: number,
            r: number
          ) => void;
        };
        if (rect.roundRect) {
          rect.roundRect(pxPos, mid - (bh + lift) / 2, bw, bh + lift, r);
        } else {
          ctx.rect(pxPos, mid - (bh + lift) / 2, bw, bh + lift);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    size();
    draw(0, false);

    let raf: number | null = null;
    let t0 = 0;
    const loop = (ts: number) => {
      if (!t0) t0 = ts;
      draw((ts - t0) / 1000 + 2, true);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf == null) {
        t0 = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf != null) {
        cancelAnimationFrame(raf);
        raf = null;
        draw(0, false);
      }
    };
    let pulseTimer: ReturnType<typeof setTimeout> | null = null;

    if (reduced) {
      draw(1.7, true);
    } else {
      card.addEventListener("mouseenter", start);
      card.addEventListener("mouseleave", stop);
      const onTouch = () => {
        start();
        if (pulseTimer) clearTimeout(pulseTimer);
        pulseTimer = setTimeout(stop, 1600);
      };
      card.addEventListener("touchstart", onTouch, { passive: true });

      let io: IntersectionObserver | null = null;
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (es) => {
            if (es[0].isIntersecting) {
              start();
              if (pulseTimer) clearTimeout(pulseTimer);
              pulseTimer = setTimeout(stop, 1400);
              io?.disconnect();
            }
          },
          { threshold: 0.6 }
        );
        io.observe(card);
      }

      const onResize = () => {
        size();
        if (raf == null) draw(0, false);
      };
      window.addEventListener("resize", onResize);

      // cursor spotlight on the card
      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty(
          "--mx",
          ((e.clientX - r.left) / r.width) * 100 + "%"
        );
        card.style.setProperty(
          "--my",
          ((e.clientY - r.top) / r.height) * 100 + "%"
        );
      };
      card.addEventListener("pointermove", onMove);

      return () => {
        card.removeEventListener("mouseenter", start);
        card.removeEventListener("mouseleave", stop);
        card.removeEventListener("touchstart", onTouch);
        card.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        if (io) io.disconnect();
        if (pulseTimer) clearTimeout(pulseTimer);
        if (raf != null) cancelAnimationFrame(raf);
      };
    }

    const onResize = () => {
      size();
      draw(1.7, true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [name]);

  return <canvas ref={canvasRef} className="bio-wave" aria-hidden="true" />;
}
