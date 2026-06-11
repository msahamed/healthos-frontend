"use client";

import { useEffect, useRef } from "react";

type Shape = {
  fn: (x: number) => number;
  mark: number;
  label: string;
  mark2?: number;
  label2?: string;
};

const SHAPES: Shape[] = [
  {
    fn: (x) => (x < 0.45 ? 0.72 : 0.72 - (x - 0.45) * 0.95),
    mark: 0.45,
    label: "2nd case",
  },
  {
    fn: (x) => 0.74 - Math.max(0, x - 0.25) * 0.78,
    mark: 0.25,
    mark2: 0.86,
    label: "voice caught it",
    label2: "you felt it",
  },
  {
    fn: (x) => 0.66 - 0.34 * Math.exp(-Math.pow((x - 0.62) / 0.1, 2)),
    mark: 0.62,
    label: "race day",
  },
  {
    fn: (x) =>
      x < 0.3 ? 0.7 : 0.34 + Math.min(1, (x - 0.3) / 0.55) * 0.33,
    mark: 0.3,
    label: "night shift",
  },
];

const N = 14;
const TEAL = "#0F766E";
const DOT = "#B9CFCB";
const AMBER = "#F59E0B";
const INK = "#8A8377";

const rnd = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

export default function PatSpark({ shapeIdx }: { shapeIdx: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const shape = SHAPES[shapeIdx];
    if (!shape) return;
    const card = cv.closest(".pat") as HTMLElement | null;
    if (!card) return;
    const actionEl = card.querySelector(".pat-action") as HTMLElement | null;

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
      if (!w || !h) return false;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const px = (x: number) => 6 + x * (w - 12);
    const py = (y: number) => h - 8 - y * (h - 22);

    const draw = (p: number) => {
      if (!w && !size()) return;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        const jitter = (rnd(i * 3.7 + shapeIdx * 31) - 0.5) * 0.22;
        const y = Math.max(0.05, Math.min(0.95, shape.fn(x) + jitter));
        ctx.fillStyle = DOT;
        ctx.beginPath();
        ctx.arc(px(x), py(y), 2.1, 0, 6.2832);
        ctx.fill();
      }

      if (p > 0) {
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        const steps = 60;
        for (let i = 0; i <= steps * p; i++) {
          const x = i / steps;
          const y = shape.fn(x);
          if (i === 0) ctx.moveTo(px(x), py(y));
          else ctx.lineTo(px(x), py(y));
        }
        ctx.stroke();
      }

      const marker = (mx: number, label?: string, after?: boolean) => {
        const my = shape.fn(mx);
        ctx.fillStyle = AMBER;
        ctx.beginPath();
        ctx.arc(px(mx), py(my), 3.4, 0, 6.2832);
        ctx.fill();
        if (label) {
          ctx.fillStyle = INK;
          ctx.font = "10.5px ui-sans-serif, system-ui, sans-serif";
          ctx.textAlign = after ? "right" : mx > 0.7 ? "right" : "left";
          const tx = px(mx) + (ctx.textAlign === "left" ? 7 : -7);
          ctx.fillText(label, tx, py(my) - 8 < 11 ? py(my) + 16 : py(my) - 8);
        }
      };
      if (p >= shape.mark) marker(shape.mark, shape.label);
      if (shape.mark2 != null && p >= shape.mark2)
        marker(shape.mark2, shape.label2, true);
    };

    size();

    const showAction = () => actionEl?.classList.add("on");

    if (reduced) {
      draw(1);
      showAction();
      const onResize = () => {
        size();
        draw(1);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    draw(0);

    let raf: number | null = null;
    const play = () => {
      if (raf != null) cancelAnimationFrame(raf);
      const t0 = performance.now();
      const DUR = 1600;
      const frame = (now: number) => {
        const p = Math.min(1, (now - t0) / DUR);
        const e = 1 - Math.pow(1 - p, 3);
        draw(e);
        if (p < 1) raf = requestAnimationFrame(frame);
        else {
          raf = null;
          showAction();
        }
      };
      raf = requestAnimationFrame(frame);
    };

    let firstPlayTimer: ReturnType<typeof setTimeout> | null = null;
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (es) => {
          if (es[0].isIntersecting) {
            firstPlayTimer = setTimeout(play, 250 + shapeIdx * 180);
            io?.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      io.observe(card);
    } else {
      play();
    }

    const onEnter = () => play();
    card.addEventListener("mouseenter", onEnter);

    const onResize = () => {
      size();
      draw(1);
    };
    window.addEventListener("resize", onResize);

    return () => {
      card.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("resize", onResize);
      if (io) io.disconnect();
      if (firstPlayTimer) clearTimeout(firstPlayTimer);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [shapeIdx]);

  return <canvas ref={canvasRef} className="pat-spark" aria-hidden="true" />;
}
