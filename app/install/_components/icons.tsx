// Small inline stroke icons for the install flow. Deliberately not an
// icon library dependency — this is the same handful of glyphs used
// across the chooser tiles and the platform pages.

type IconProps = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LaptopIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="4" y="4.5" width="16" height="10.5" rx="1.4" />
      <path d="M2.5 18.5h19l-1.4-2.3H3.9z" />
    </svg>
  );
}

export function PhoneIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="6.5" y="2.8" width="11" height="18.4" rx="2.4" />
      <path d="M10.6 18.4h2.8" />
    </svg>
  );
}

export function AndroidIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="6.5" y="2.8" width="11" height="18.4" rx="2.4" />
      <circle cx="12" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WindowsIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

export function DownloadIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8}>
      <path d="M12 3v12" />
      <path d="M7 10.5 12 15.5 17 10.5" />
      <path d="M4.5 19h15" />
    </svg>
  );
}

export function RefreshIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.7}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" />
      <path d="M20 4.5v4h-4M4 19.5v-4h4" />
    </svg>
  );
}

export function LockIcon({ size = 11, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.7}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.6" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
    </svg>
  );
}
