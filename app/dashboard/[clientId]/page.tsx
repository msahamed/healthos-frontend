// /dashboard/[clientId] — one person's analytics.
//
// getClientDetail() is the authorization boundary: it returns null for
// any user_id this session may not see, which today means anyone but
// yourself. A missing person and a forbidden one both render as 404,
// so the page cannot be used to probe which user_ids exist.

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getClientDetail } from "@/lib/dashboard";
import { getDayMeans } from "@/lib/coach-analytics";
import { DeviationBars, TrendChart, markColor } from "../charts";
import CoachView from "./coach-view";

export const dynamic = "force-dynamic";

function ago(d: Date | null): string {
  if (!d) return "never";
  const days = Math.round((Date.now() - d.getTime()) / 864e5);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return "over a month ago";
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const { clientId } = await params;
  const client = await getClientDetail(session, clientId);
  if (!client) notFound();

  // First paint pulls day rows only — a few dozen small rows that
  // three panels read from. Everything heavier loads on demand.
  const dayRows = await getDayMeans(client.userId, 90);

  const isSelf = client.userId === session.userId;
  const who = isSelf ? "your" : "their";
  const standout = client.standout;
  const color = markColor(standout?.ratio ?? 0, Boolean(standout?.notable));

  return (
    <>
      <Link className="back" href="/dashboard">
        <svg viewBox="0 0 24 24">
          <path d="m14 6-6 6 6 6" />
        </svg>{" "}
        All clients
      </Link>

      <div className="topbar">
        <div>
          <h1>{isSelf ? "You" : client.name}</h1>
          <p className="sub">
            {client.count30} check-ins in the last 30 days. Last one {ago(client.lastAt)}.
          </p>
        </div>
      </div>

      <div className="cols" style={{ marginTop: 20 }}>
        <div className="panel">
          <div className="panelhead">
            <h2>This week against {who} usual</h2>
          </div>
          <div className="axiscap">
            <span />
            <span>lower &nbsp;·&nbsp; {who} usual &nbsp;·&nbsp; higher</span>
            <span />
          </div>
          <DeviationBars deltas={client.deltas} />
          <div className="legend">
            <span>
              <i style={{ background: "var(--below)" }} />
              Below {who} usual
            </span>
            <span>
              <i style={{ background: "var(--above)" }} />
              Above {who} usual
            </span>
          </div>
          <p className="note">
            Every marker is scored against this person&apos;s own baseline, not against other people.
            A number only means something next to their own normal.
          </p>
        </div>

        <div className="panel">
          <div className="panelhead">
            <h2>{standout ? `${standout.label}, last 30 days` : "Last 30 days"}</h2>
          </div>
          <div style={{ padding: "14px 18px 6px" }}>
            <TrendChart points={client.trend} band={client.band} color={color} />
          </div>
          <p className="note">
            The band is {who} usual range. This is the marker sitting furthest from baseline right
            now, which is why it is the one shown.
          </p>
        </div>
      </div>

      <CoachView days={dayRows} clientId={client.userId} />

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panelhead">
          <h2>What a coach cannot see</h2>
        </div>
        <p className="note" style={{ paddingTop: 14 }}>
          Ontor never shares what someone said. No recordings, no transcripts, no words. A coach
          sees how a voice moved against its own baseline, and nothing else. Sharing can be stopped
          at any time.
        </p>
      </div>
    </>
  );
}
