import type { CSSProperties } from "react";

const TEAL = "#0F766E";
const AMBER = "#F59E0B";

type LogoProps = {
  size?: number;
  pulse?: boolean;
  tone?: "solid" | "on-dark";
  className?: string;
  style?: CSSProperties;
};

const BAR_HEIGHTS = [0.28, 0.5, 0.68, 0.5, 0.28];

export default function Logo({
  size = 32,
  pulse = false,
  tone = "solid",
  className,
  style,
}: LogoProps) {
  const radius = size * 0.22;
  const barWidth = size * 0.09;
  const gap = size * 0.07;
  const totalWidth = BAR_HEIGHTS.length * barWidth + (BAR_HEIGHTS.length - 1) * gap;
  const startX = (size - totalWidth) / 2;
  const containerBg = tone === "on-dark" ? "rgba(255,255,255,0.15)" : TEAL;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        ...style,
      }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block", borderRadius: radius, backgroundColor: containerBg }}
      >
        {BAR_HEIGHTS.map((h, i) => {
          const barHeight = size * h;
          const x = startX + i * (barWidth + gap);
          const y = (size - barHeight) / 2;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={barWidth / 2}
              fill={AMBER}
              style={
                pulse
                  ? {
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      animation: "wave-bar 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.12}s`,
                    }
                  : undefined
              }
            />
          );
        })}
      </svg>
    </span>
  );
}
