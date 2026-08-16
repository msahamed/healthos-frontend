// The coach's read on one person. Ported from the approved design
// ("Coach analytics dashboard redesign").
//
// Fetch strategy, which is the reason for the chips:
//   - Day rows arrive with the page. Every dial chip and the 7/30
//     toggle in "Each dial" re-derive from those rows in the browser,
//     so switching costs nothing and hits no network.
//   - Time of day, the matrix and recovery each load once, lazily,
//     the first time you ask for them, and are cached per range.
//
// The trailing slash in those URLs is required, not cosmetic: the site
// runs trailingSlash:true, so the bare form 308-redirects and every
// panel would pay an extra round trip.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HIGH_IS_BAD,
  MARKER_KEYS,
  MARKER_LABEL,
  sharesInputs,
  triage as computeTriage,
  zoneFor,
  type DayRow,
  type MarkerKey,
  type Recovery,
} from "@/lib/markers";
import { SERIES } from "@/lib/markers";

type Range = 7 | 30;
type Bucket = { bucket: string; n: number; m: Partial<Record<MarkerKey, number>> };

const GOOD = "#0A9384";
const BAD = "#BE5128";

export default function CoachView({ days, clientId }: { days: DayRow[]; clientId: string }) {
  const [range, setRange] = useState<Range>(7);
  const [dial, setDial] = useState<MarkerKey>("stress");

  const t = computeTriage(days, 7);
  const flagged = t.filter((x) => x.level === 2 && x.bad);
  const zone = zoneFor(days, dial, range === 7 ? 7 : 30);

  const headline = !t.length
    ? "Not enough history yet to compare a week against a usual."
    : flagged.length === 0
      ? "Nothing is off their usual this week."
      : flagged.length === 1
        ? `${flagged[0]!.name} has moved off their usual this week.`
        : `${flagged.length} dials have moved off their usual this week.`;

  return (
    <>
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panelhead"><h2>{headline}</h2></div>
        <div className="dials">
          {t.map((d) => (
            <div className="dial" key={d.key} style={{ borderColor: d.level === 2 ? (d.bad ? BAD : GOOD) : "var(--line)" }}>
              <div className="dialtop">
                <span className="dialname">{d.name}</span>
                {d.level > 0 && (
                  <span className="dialbadge" style={{
                    color: d.bad ? BAD : GOOD,
                    background: `color-mix(in srgb, ${d.bad ? BAD : GOOD} 12%, transparent)`,
                  }}>
                    {d.level === 2 ? (d.bad ? "off usual" : "better") : "watch"}
                  </span>
                )}
              </div>
              <div className="dialrow">
                <div>
                  <div className="dialval num">{Math.round(d.recent)}</div>
                  <div className="dialdelta num" style={{ color: d.level ? (d.bad ? BAD : GOOD) : "var(--ink-mute)" }}>
                    {d.delta >= 0 ? "+" : "−"}{Math.abs(d.delta).toFixed(1)} vs usual {Math.round(d.usual)}
                  </div>
                </div>
                <Mini values={d.spark} color={d.level ? (d.bad ? BAD : GOOD) : "var(--ink-mute)"} />
              </div>
            </div>
          ))}
        </div>
        <p className="note">
          Scores run 0 to 100 and are read from the sound of the voice only. Usual is this
          person&apos;s own average across the run, and the comparison respects their normal day to
          day swing, so a small difference is treated as noise rather than news.
        </p>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="eyebrow">Day by day, against their own usual</div>
        <div className="panelhead spread">
          <h2>Each dial, in one look</h2>
          <div className="seg">
            <button onClick={() => setRange(7)} aria-pressed={range === 7}>Last 7 days</button>
            <button onClick={() => setRange(30)} aria-pressed={range === 30}>Last 30 days</button>
          </div>
        </div>
        <p className="note">
          Each dot is one day&apos;s average. The band is their usual zone for that dial, one swing
          either side of their own baseline. A dot outside the band moved further than their normal
          wobble. Gaps are days with no check-ins.
        </p>
        <div className="chips">
          {MARKER_KEYS.map((k) => (
            <button key={k} className="chip-btn" aria-pressed={k === dial} onClick={() => setDial(k)}>
              <i style={{ background: SERIES[k] }} />
              {MARKER_LABEL[k]}
            </button>
          ))}
        </div>
        <div className="padded"><ZoneChart zone={zone} /></div>
      </section>

      <TimeOfDayPanel clientId={clientId} />
      <RecoveryPanel clientId={clientId} />
      <MatrixPanel clientId={clientId} />
    </>
  );
}

// ── Panels that fetch ─────────────────────────────────────────────

function useLazyPanel<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const cache = useRef(new Map<string, T>());

  const load = useCallback(async () => {
    if (!url) return;
    const hit = cache.current.get(url);
    if (hit) { setData(hit); setState("idle"); return; }
    setState("loading");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as T;
      cache.current.set(url, json);
      setData(json);
      setState("idle");
    } catch {
      setState("error");
    }
  }, [url]);

  useEffect(() => { void load(); }, [load]);
  return { data, state };
}

function TimeOfDayPanel({ clientId }: { clientId: string }) {
  const [overlay, setOverlay] = useState<MarkerKey>("breathing");
  const keys: MarkerKey[] = ["confidence", overlay];
  const { data, state } = useLazyPanel<{ buckets: Bucket[] }>(
    `/api/v1/dashboard/${clientId}/?panel=tod&days=90&keys=${keys.join(",")}`,
  );

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="eyebrow">Time of day</div>
      <div className="panelhead"><h2>When confidence is strongest</h2></div>
      <p className="note">
        Pooled by the part of day recorded on the device, in their local time. Useful for timing
        sessions and hard conversations, not for judging progress. The cloud stores a local date and
        this bucket but no local hour, so this is four buckets rather than an hourly curve.
      </p>
      <div className="chips">
        {MARKER_KEYS.filter((k) => k !== "confidence").map((k) => (
          <button key={k} className="chip-btn" aria-pressed={k === overlay} onClick={() => setOverlay(k)}>
            <i style={{ background: SERIES[k] }} />
            {MARKER_LABEL[k]}
          </button>
        ))}
      </div>
      <div className="padded">
        {state === "loading" && <p className="note">Loading…</p>}
        {state === "error" && <p className="note">Could not load this panel.</p>}
        {data && <TodChart buckets={data.buckets} keys={keys} />}
      </div>
    </section>
  );
}

function RecoveryPanel({ clientId }: { clientId: string }) {
  const [range, setRange] = useState<Range>(30);
  const { data, state } = useLazyPanel<Recovery>(
    `/api/v1/dashboard/${clientId}/?panel=recovery&days=${range}&marker=stress`,
  );

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="eyebrow">Recovery</div>
      <div className="panelhead spread">
        <h2>How fast a spike comes down</h2>
        <div className="seg">
          <button onClick={() => setRange(7)} aria-pressed={range === 7}>Last 7 days</button>
          <button onClick={() => setRange(30)} aria-pressed={range === 30}>Last 30 days</button>
        </div>
      </div>
      {state === "loading" && <p className="note">Loading…</p>}
      {state === "error" && <p className="note">Could not load this panel.</p>}
      {data && data.n === 0 && (
        <p className="note">
          No stress spikes with enough surrounding detail in this range. Recovery needs a check-in
          long enough to be scored more than once.
        </p>
      )}
      {data && data.n > 0 && (
        <>
          <p className="note">
            Everyone spikes. The trainable part is how fast the voice settles back to its own
            baseline. All {data.n} {data.n === 1 ? "spike" : "spikes"} in this range, by how long
            they took. About {data.floorSec} seconds is the fastest these check-ins can measure, so
            the first band means at least that fast. That floor is per person, not a fixed number.
          </p>
          <div className="padded"><RecBar buckets={data.buckets} /></div>
          {data.atFloor && (
            <p className="note">
              Most spikes land in the first band, so the true come-down is faster than this run can
              measure. Read it as a direction, not a number.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function MatrixPanel({ clientId }: { clientId: string }) {
  const { data, state } = useLazyPanel<{ keys: MarkerKey[]; matrix: number[][] }>(
    `/api/v1/dashboard/${clientId}/?panel=matrix&days=90`,
  );

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="eyebrow">Seven dials, one map</div>
      <div className="panelhead"><h2>How the markers move together</h2></div>
      <p className="note">
        Every marker against every other, across every scored window. A ringed cell means the pair
        shares inputs, so part of that agreement is by construction rather than a finding.
      </p>
      <div className="padded">
        {state === "loading" && <p className="note">Loading…</p>}
        {state === "error" && <p className="note">Could not load this panel.</p>}
        {data && <Matrix keys={data.keys} m={data.matrix} />}
      </div>
    </section>
  );
}

// ── Marks ─────────────────────────────────────────────────────────

function Mini({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <span className="dialmini" />;
  const w = 68, h = 24, p = 2;
  const lo = Math.min(...values), hi = Math.max(...values), r = hi - lo || 1;
  const x = (i: number) => p + (i * (w - 2 * p)) / (values.length - 1);
  const y = (v: number) => h - p - ((v - lo) / r) * (h - 2 * p);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")}
        fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ZoneChart({ zone }: { zone: ReturnType<typeof zoneFor> }) {
  if (zone.points.length < 2) return <p className="note">Not enough days in this range.</p>;
  const w = 900, h = 240, L = 34, R = 14, T = 14, B = 30;
  const t0 = Date.parse(zone.points[0]!.day);
  const t1 = Date.parse(zone.points[zone.points.length - 1]!.day);
  const span = t1 - t0 || 1;
  const x = (d: string) => L + ((Date.parse(d) - t0) / span) * (w - L - R);
  const y = (v: number) => h - B - (v / 100) * (h - T - B);
  const bandTop = y(Math.min(100, zone.baseline + zone.swing));
  const bandBot = y(Math.max(0, zone.baseline - zone.swing));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img"
      aria-label={`${zone.name} by day against a usual band of ${Math.round(zone.baseline)} plus or minus ${Math.round(zone.swing)}.`}>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={L} x2={w - R} y1={y(g)} y2={y(g)} stroke="var(--line)" />
          <text x={L - 6} y={y(g) + 3.5} fontSize="10" textAnchor="end" fill="var(--ink-mute)">{g}</text>
        </g>
      ))}
      <rect x={L} y={bandTop} width={w - L - R} height={Math.max(bandBot - bandTop, 2)}
        fill={GOOD} opacity="0.10" rx="4" />
      <line x1={L} x2={w - R} y1={y(zone.baseline)} y2={y(zone.baseline)}
        stroke={GOOD} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
      <text x={w - R} y={y(zone.baseline) - 6} fontSize="10" textAnchor="end" fill="var(--ink-mute)">
        their baseline {Math.round(zone.baseline)}
      </text>
      <path d={zone.points.map((p, i) => `${i ? "L" : "M"}${x(p.day).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ")}
        fill="none" stroke="var(--ink-mute)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5" />
      {zone.points.map((p) => (
        <circle key={p.day} cx={x(p.day).toFixed(1)} cy={y(p.v).toFixed(1)} r={p.out ? 5 : 3.5}
          fill={p.out ? (p.bad ? BAD : GOOD) : "var(--ink-mute)"}
          stroke="var(--paper)" strokeWidth="1.5">
          <title>{`${p.day} · ${Math.round(p.v)}`}</title>
        </circle>
      ))}
      <text x={L} y={h - 8} fontSize="10" fill="var(--ink-mute)">{zone.points[0]!.day}</text>
      <text x={w - R} y={h - 8} fontSize="10" textAnchor="end" fill="var(--ink-mute)">
        {zone.points[zone.points.length - 1]!.day}
      </text>
    </svg>
  );
}

function TodChart({ buckets, keys }: { buckets: Bucket[]; keys: MarkerKey[] }) {
  if (!buckets.length) return <p className="note">Not enough readings to split by time of day.</p>;
  return (
    <figure style={{ margin: 0 }}>
      <div className="tod">
        {buckets.map((b) => (
          <div className="todcol" key={b.bucket}>
            <div className="todbars">
              {keys.map((k) => {
                const v = b.m[k];
                return (
                  <span key={k} className="todbar"
                    style={{ height: v == null ? 2 : `${Math.max(v, 2)}%`, background: SERIES[k] }}
                    title={`${MARKER_LABEL[k]} ${v == null ? "no data" : Math.round(v)}`} />
                );
              })}
            </div>
            <div className="todlab">{b.bucket}</div>
            <div className="todn num">{b.n}</div>
          </div>
        ))}
      </div>
      <figcaption className="legend" style={{ paddingTop: 12 }}>
        {keys.map((k) => (
          <span key={k}><i style={{ background: SERIES[k] }} />{MARKER_LABEL[k]}</span>
        ))}
      </figcaption>
    </figure>
  );
}

function RecBar({ buckets }: { buckets: Recovery["buckets"] }) {
  const shades = ["#0A9384", "#3FA894", "#8FB9A4", "#C9A66B", "#BE5128"];
  return (
    <>
      <div className="recbar">
        {buckets.map((b, i) => (
          <span key={b.label} style={{ width: `${b.pct}%`, background: shades[Math.min(i, shades.length - 1)] }}
            title={`${b.label}: ${b.n} (${b.pct}%)`} />
        ))}
      </div>
      <div className="legend" style={{ paddingTop: 12 }}>
        {buckets.map((b, i) => (
          <span key={b.label}>
            <i style={{ background: shades[Math.min(i, shades.length - 1)] }} />
            {b.label} · <b>{b.pct}%</b> ({b.n})
          </span>
        ))}
      </div>
    </>
  );
}

function Matrix({ keys, m }: { keys: MarkerKey[]; m: number[][] }) {
  return (
    <div className="matwrap">
      <table className="mat">
        <thead>
          <tr>
            <th />
            {keys.map((k) => <th key={k} title={MARKER_LABEL[k]}>{MARKER_LABEL[k].slice(0, 4)}</th>)}
          </tr>
        </thead>
        <tbody>
          {keys.map((a, i) => (
            <tr key={a}>
              <th scope="row">{MARKER_LABEL[a]}</th>
              {keys.map((b, j) => {
                const v = m[i]?.[j] ?? 0;
                const self = i === j;
                // Sequential by strength, hue by direction. Neutral at zero.
                const bg = self
                  ? "var(--paper-3)"
                  : `color-mix(in srgb, ${v > 0 ? GOOD : BAD} ${Math.round(Math.abs(v) * 70)}%, transparent)`;
                return (
                  <td key={b} style={{ background: bg }}
                    className={!self && sharesInputs(a, b) ? "shared" : undefined}
                    title={self ? "" : `${MARKER_LABEL[a]} and ${MARKER_LABEL[b]}: r = ${v.toFixed(2)}${sharesInputs(a, b) ? " (shares inputs)" : ""}`}>
                    <span className="num">{self ? "—" : v.toFixed(2)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note" style={{ padding: "12px 0 0" }}>
        Teal is moves together, clay is moves opposite, stronger colour is a stronger relationship.
        Ringed cells share inputs.
      </p>
    </div>
  );
}

export { HIGH_IS_BAD };
