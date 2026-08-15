// /dashboard — the roster.
//
// A coach with no clients sees exactly one row: themselves. That is
// deliberate rather than an empty state. The page is built as a
// roster from the start, so adding sharing later adds rows instead of
// replacing the screen.

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getRoster, aggregate, type ClientSummary } from "@/lib/dashboard";
import { Sparkline, markColor } from "./charts";

export const dynamic = "force-dynamic";

function ago(d: Date | null): string {
  if (!d) return "never";
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs === 1 ? "an hour ago" : `${hrs} hours ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return "over a month ago";
}

function standoutPhrase(c: ClientSummary): { text: string; cls: string } {
  if (!c.count30) return { text: "No check-ins yet", cls: "flat" };
  const s = c.standout;
  if (!s || !s.notable) return { text: "Steady", cls: "flat" };
  const dir = s.ratio > 0 ? "above" : "below";
  return { text: `${s.label} ${dir} the usual`, cls: s.ratio > 0 ? "up" : "down" };
}

const ARROW = {
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  flat: <path d="M5 12h14" />,
} as const;

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const roster = await getRoster(session);
  const totals = aggregate(roster);
  const soloRoster = roster.length === 1 && roster[0]!.userId === session.userId;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Clients</h1>
          <p className="sub">
            {soloRoster
              ? "No one is sharing with you yet, so this is your own voice data."
              : `${totals.people} people sharing their check-ins with you.`}
          </p>
        </div>
        <div className="spacer" />
        <button className="btn" type="button" aria-disabled="true" title="Not available yet">
          Invite a client
        </button>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="k">{soloRoster ? "Sharing with you" : "People"}</div>
          <div className="v num">{soloRoster ? 0 : totals.people}</div>
          <div className="n">{soloRoster ? "invites are not live yet" : "sharing their check-ins"}</div>
        </div>
        <div className="tile">
          <div className="k">Check-ins this week</div>
          <div className="v num">{totals.checkinsWeek}</div>
          <div className="n">last seven days</div>
        </div>
        <div className="tile">
          <div className="k">Worth a look</div>
          <div className="v num">{totals.worthALook}</div>
          <div className="n">a marker well off the usual</div>
        </div>
        <div className="tile">
          <div className="k">Quiet 7 days</div>
          <div className="v num">{totals.quiet}</div>
          <div className="n">no check-in since last week</div>
        </div>
      </div>

      <div className="panel">
        <div className="panelhead">
          <h2>{soloRoster ? "You" : "Everyone"}</h2>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th className="r">
                  Check-ins
                  <br />
                  30 days
                </th>
                <th>Last 14 days</th>
                <th>Last check-in</th>
                <th>What stands out</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((c) => {
                const phrase = standoutPhrase(c);
                const color = markColor(c.standout?.ratio ?? 0, Boolean(c.standout?.notable));
                return (
                  <tr key={c.userId}>
                    <td>
                      <Link className="rowlink" href={`/dashboard/${c.userId}`}>
                        <div className="who">
                          <span className="avatar">{c.initials}</span>
                          <span>
                            <b>{c.name}</b>
                            <small>{c.email}</small>
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="r num">{c.count30}</td>
                    <td>
                      <Sparkline values={c.spark} color={color} />
                    </td>
                    <td style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{ago(c.lastAt)}</td>
                    <td>
                      <span className={`chip ${phrase.cls}`}>
                        <svg viewBox="0 0 24 24">{ARROW[phrase.cls as keyof typeof ARROW]}</svg>
                        {phrase.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
