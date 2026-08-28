import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionFromCookies } from "@/lib/auth";
import { acceptById, endShare, grantToCoach, listForClient } from "@/lib/shares";

export const dynamic = "force-dynamic";

export default async function SharingPage({
  searchParams,
}: {
  searchParams: Promise<{ shared?: string; err?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");
  const [sharedWith, params] = await Promise.all([listForClient(session), searchParams]);

  async function startSharing(formData: FormData) {
    "use server";
    const current = await getSessionFromCookies();
    if (!current) redirect("/login");
    const res = await grantToCoach(current, String(formData.get("coachEmail") ?? ""));
    if (!res.ok) redirect(`/dashboard/team/sharing?err=${encodeURIComponent(res.error)}`);
    revalidatePath("/dashboard/team/sharing");
    redirect(`/dashboard/team/sharing?shared=${res.coachHasAccount ? "1" : "pending"}`);
  }

  async function acceptShare(formData: FormData) {
    "use server";
    const current = await getSessionFromCookies();
    if (!current) redirect("/login");
    await acceptById(current, String(formData.get("id") ?? ""));
    revalidatePath("/dashboard/team/sharing");
    redirect("/dashboard/team/sharing?shared=1");
  }

  async function stopSharing(formData: FormData) {
    "use server";
    const current = await getSessionFromCookies();
    if (!current) redirect("/login");
    await endShare(current, String(formData.get("id") ?? ""));
    revalidatePath("/dashboard/team/sharing");
    redirect("/dashboard/team/sharing");
  }

  return <>
    <div className="topbar">
      <div>
        <h1>Sharing</h1>
        <p className="sub">You decide who can see how your signals move against your usual range. They never see or hear what you said.</p>
      </div>
    </div>

    <section className="sect sharingSection">
      <h2 className="sectTitle">Share with a coach</h2>
      <p className="sub">Enter the address they use for Ontor. You can stop sharing at any time.</p>
      {params.shared === "1" && <p className="fmsg ok">Sharing started. They can see your check-ins now.</p>}
      {params.shared === "pending" && <p className="fmsg ok">Sharing is ready. They will see it after signing in with that address.</p>}
      {params.err && <p className="fmsg err">{params.err}</p>}
      <form action={startSharing} className="inviteform sharingForm">
        <input type="email" name="coachEmail" required placeholder="coach@example.com" aria-label="Coach email" />
        <button className="btn" type="submit">Share with a coach</button>
      </form>
    </section>

    <section className="sect sharingSection">
      <h2 className="sectTitle">People with access</h2>
      <div className="card">
        {sharedWith.length === 0 ? <p className="fhint" style={{ margin: 0 }}>You are not sharing your check-ins with anyone.</p> : (
          <ul className="shares" style={{ padding: 0 }}>{sharedWith.map((person) => <li key={person.id}>
            <span>
              <b>{person.coachName ?? person.coachEmail}</b>
              {person.coachName && <small>{person.coachEmail}</small>}
              <small>{person.status === "active" ? `sharing since ${(person.acceptedAt ?? person.createdAt).toISOString().slice(0, 10)}` : "invited you to share"}</small>
            </span>
            <span className="rowactions">
              {person.status === "pending" && <form action={acceptShare}><input type="hidden" name="id" value={person.id} /><button className="linkbtn accept" type="submit">Accept</button></form>}
              <form action={stopSharing}><input type="hidden" name="id" value={person.id} /><button className="linkbtn" type="submit">{person.status === "active" ? "Stop sharing" : "Decline"}</button></form>
            </span>
          </li>)}</ul>
        )}
      </div>
    </section>
  </>;
}
