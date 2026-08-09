import Link from "next/link";
import { ReactNode } from "react";
import { LockIcon, DownloadIcon } from "./icons";

type TileState = "live" | "locked" | "soon";

const BADGE_LABEL: Record<TileState, string> = {
  live: "Available now",
  locked: "Private beta",
  soon: "Coming soon",
};

type Props = {
  href: string;
  state: TileState;
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
};

// One platform card in the /install chooser grid. State drives badge,
// icon tone, and the CTA style (live gets a download icon, locked gets
// a lock icon, soon is quiet text) — no per-platform layout branching.
export default function PlatformTile({ href, state, icon, title, description, ctaLabel }: Props) {
  return (
    <Link href={href} className={`ch-tile is-${state}`}>
      <span className={`inst-badge is-${state}`}>{BADGE_LABEL[state]}</span>
      <span className="ch-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={`ch-cta ${state === "live" ? "is-live" : "is-quiet"}`}>
        {state === "live" && <DownloadIcon size={13} />}
        {state === "locked" && <LockIcon size={11} />}
        {ctaLabel}
      </span>
    </Link>
  );
}
