import type { CSSProperties, ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
  width?: number;
  className?: string;
  style?: CSSProperties;
  tone?: "dark" | "light";
};

export default function PhoneFrame({
  children,
  width = 280,
  className,
  style,
  tone = "dark",
}: PhoneFrameProps) {
  const aspect = 19.5 / 9;
  const height = width * aspect;
  const radius = width * 0.16;
  const bezel = Math.max(8, width * 0.034);
  const notchWidth = width * 0.32;
  const notchHeight = width * 0.055;

  const bezelColor = tone === "dark" ? "#111827" : "#E5E7EB";

  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        padding: bezel,
        background: bezelColor,
        boxShadow:
          "0 30px 60px -20px rgba(15,23,42,0.35), 0 12px 30px -10px rgba(15,23,42,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)",
        position: "relative",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          background: "white",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: bezel + 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: notchWidth,
          height: notchHeight,
          background: bezelColor,
          borderRadius: 9999,
          zIndex: 2,
        }}
      />
    </div>
  );
}
