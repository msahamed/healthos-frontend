// /dashboard — the roster.
//
// A coach with no clients sees exactly one row: themselves. That is
// deliberate rather than an empty state. The page is built as a
// roster from the start, so adding sharing later adds rows instead of
// replacing the screen.

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionFromCookies } from "@/lib/auth";
import { createInvite, endShare, listForCoach } from "@/lib/shares";
import { sendShareInvite } from "@/lib/email";
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

/** Invite a client. Server action: no endpoint, session from cookie. */
async function invite(formData: FormData) {
  "use server";
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const res = await createInvite(session, String(formData.get("email") ?? ""));
  if (!res.ok) redirect(`/dashboard?err=${encodeURIComponent(res.error)}`);

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ontor.ai"}/share/${res.token}/`;
  try {
    await sendShareInvite(String(formData.get("email") ?? "").trim().toLowerCase(), session.email, url);
  } catch {
    // The invite row exists but the mail did not go. Say so rather
    // than reporting success and leaving them waiting for an email
    // that is never coming.
    redirect("/dashboard?err=" + encodeURIComponent("Invite saved, but the email could not be sent. Try again."));
  }
  revalidatePath("/dashboard");
  redirect("/dashboard?sent=1");
}

async function removeShare(formData: FormData) {
  "use server";
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  await endShare(session, String(formData.get("id") ?? ""));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; err?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const [roster, shares, params] = await Promise.all([
    getRoster(session),
    listForCoach(session.userId),
    searchParams,
  ]);
  const pending = shares.filter((x) => x.status === "pending");
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
        <form action={invite} className="inviteform">
          <input
            type="email"
            name="email"
            required
            placeholder="client@example.com"
            aria-label="Client email"
          />
          <button className="btn" type="submit">Invite a client</button>
        </form>
      </div>

      {params.err && <p className="fmsg err" style={{ marginTop: 12 }}>{params.err}</p>}
      {params.sent && (
        <p className="fmsg ok" style={{ marginTop: 12 }}>
          Invite sent. They will show up here once they accept.
        </p>
      )}

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

      {pending.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panelhead"><h2>Waiting on</h2></div>
          <ul className="shares">
            {pending.map((p) => (
              <li key={p.id}>
                <span>
                  <b>{p.clientEmail}</b>
                  <small>invited {p.createdAt.toISOString().slice(0, 10)} · not accepted yet</small>
                </span>
                <form action={removeShare}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="linkbtn" type="submit">Cancel</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
