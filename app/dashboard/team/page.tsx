import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionFromCookies } from "@/lib/auth";
import { createInvite, endShare, listForCoach } from "@/lib/shares";
import { sendShareInvite } from "@/lib/email";
import { getRoster, aggregate, type ClientSummary } from "@/lib/dashboard";
import { getProfile } from "@/lib/profile";
import { Sparkline, markColor } from "../charts";

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

function standoutPhrase(person: ClientSummary): { text: string; cls: string } {
  if (!person.count30) return { text: "No check-ins yet", cls: "flat" };
  const signal = person.standout;
  if (!signal?.notable) return { text: "Steady", cls: "flat" };
  const direction = signal.ratio > 0 ? "above" : "below";
  return { text: `${signal.label} ${direction} the usual`, cls: signal.ratio > 0 ? "up" : "down" };
}

const ARROW = {
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  flat: <path d="M5 12h14" />,
} as const;

async function invite(formData: FormData) {
  "use server";
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  const profile = await getProfile(session.userId);
  const res = await createInvite({ ...session, name: profile.fullName }, String(formData.get("email") ?? ""));
  if (!res.ok) redirect(`/dashboard/team?err=${encodeURIComponent(res.error)}`);
  const who = `${profile.fullName!.trim()} (${session.email})`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ontor.ai"}/share/${res.token}/`;
  try {
    await sendShareInvite(String(formData.get("email") ?? "").trim().toLowerCase(), who, url);
  } catch {
    redirect("/dashboard/team?err=" + encodeURIComponent("Invite saved, but the email could not be sent. Try again."));
  }
  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?sent=1");
}

async function removeShare(formData: FormData) {
  "use server";
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  await endShare(session, String(formData.get("id") ?? ""));
  revalidatePath("/dashboard/team");
  redirect("/dashboard/team");
}

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ sent?: string; err?: string }> }) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  const [roster, shares, profile, params] = await Promise.all([
    getRoster(session), listForCoach(session.userId), getProfile(session.userId), searchParams,
  ]);
  const pending = shares.filter((share) => share.status === "pending");
  const totals = aggregate(roster);

  return <>
    <div className="topbar">
      <div>
        <h1>Team members</h1>
        <p className="sub">People who chose to share their Ontor check-ins with you. Each person is compared only with their own usual range.</p>
      </div>
      <div className="spacer" />
      {profile.fullName?.trim() ? (
        <form action={invite} className="inviteform">
          <input type="email" name="email" required placeholder="name@company.com" aria-label="Team member email" />
          <button className="btn" type="submit">Invite team member</button>
        </form>
      ) : <Link className="btn ghost" href="/dashboard/profile/">Add your name to invite</Link>}
    </div>
    {params.err && <p className="fmsg err" style={{ marginTop: 12 }}>{params.err}</p>}
    {params.sent && <p className="fmsg ok" style={{ marginTop: 12 }}>Invite sent. They will appear here after they accept.</p>}

    <div className="tiles">
      <div className="tile"><div className="k">Team members</div><div className="v num">{totals.people}</div><div className="n">including you</div></div>
      <div className="tile"><div className="k">Check-ins this week</div><div className="v num">{totals.checkinsWeek}</div><div className="n">across shared accounts</div></div>
      <div className="tile"><div className="k">Worth a look</div><div className="v num">{totals.worthALook}</div><div className="n">outside their usual range</div></div>
      <div className="tile"><div className="k">Quiet 7 days</div><div className="v num">{totals.quiet}</div><div className="n">no recent check-in</div></div>
    </div>

    <div className="panel">
      <div className="panelhead"><h2>Shared with you</h2></div>
      <div className="scroll"><table>
        <thead><tr><th>Team member</th><th className="r">Check-ins<br />30 days</th><th>Last 14 days</th><th>Last check-in</th><th>What stands out</th></tr></thead>
        <tbody>{roster.map((person) => {
          const phrase = standoutPhrase(person);
          const color = markColor(person.standout?.ratio ?? 0, Boolean(person.standout?.notable));
          return <tr key={person.userId}>
            <td><Link className="rowlink" href={person.userId === session.userId ? "/dashboard" : `/dashboard/${person.userId}`}><div className="who"><span className="avatar">{person.initials}</span><span><b>{person.userId === session.userId ? "You" : person.name}</b><small>{person.email}</small></span></div></Link></td>
            <td className="r num">{person.count30}</td><td><Sparkline values={person.spark} color={color} /></td>
            <td style={{ color: "var(--ink-soft)", fontSize: 13.5 }}>{ago(person.lastAt)}</td>
            <td><span className={`chip ${phrase.cls}`}><svg viewBox="0 0 24 24">{ARROW[phrase.cls as keyof typeof ARROW]}</svg>{phrase.text}</span></td>
          </tr>;
        })}</tbody>
      </table></div>
    </div>

    {pending.length > 0 && <div className="panel" style={{ marginTop: 16 }}>
      <div className="panelhead"><h2>Waiting for a response</h2></div>
      <ul className="shares">{pending.map((share) => <li key={share.id}>
        <span><b>{share.clientEmail}</b><small>invited {share.createdAt.toISOString().slice(0, 10)}</small></span>
        <form action={removeShare}><input type="hidden" name="id" value={share.id} /><button className="linkbtn" type="submit">Cancel invite</button></form>
      </li>)}</ul>
    </div>}
  </>;
}
