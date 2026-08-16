// /share/[token] — where a client accepts a coach's invite.
//
// Public, because the link arrives by email and the person may have no
// account yet. Signing in is what creates one, so there is no separate
// signup: not signed in sends them to /login with a next= back here.
//
// The page states what a coach will and will not see BEFORE the button,
// because this is the consent moment and it is the only place a client
// is told.

import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import { acceptInvite, findByToken } from "@/lib/shares";
// Not under /dashboard, so the shell does not load this for us.
import "../../dashboard/dashboard.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Share your Ontor readings — Ontor",
  robots: { index: false, follow: false },
};

export default async function AcceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const [{ token }, sp, session] = await Promise.all([
    params,
    searchParams,
    getSessionFromCookies(),
  ]);

  const share = await findByToken(token);

  if (!share || share.status === "ended") {
    return (
      <Shell title="That invite is not open">
        <p className="sub">
          The link may have been cancelled or already used. Ask whoever invited you to send a new
          one.
        </p>
      </Shell>
    );
  }

  if (share.status === "active") {
    return (
      <Shell title="You are already sharing">
        <p className="sub">
          {share.coachName ?? share.coachEmail} can see how your voice moves against your own
          usual. You can stop any time from your profile.
        </p>
        <Link className="btn" href="/dashboard/profile/">Manage sharing</Link>
      </Shell>
    );
  }

  async function accept() {
    "use server";
    const s = await getSessionFromCookies();
    if (!s) redirect(`/login/?next=${encodeURIComponent(`/share/${token}/`)}`);
    const res = await acceptInvite(s, token);
    if (!res.ok) redirect(`/share/${token}/?err=${encodeURIComponent(res.error)}`);
    redirect("/dashboard/profile/?shared=1");
  }

  return (
    <Shell title={`${share.coachName ?? share.coachEmail} is inviting you to their program`}>
      {share.coachName && <p className="sub">{share.coachEmail}</p>}
      <p className="sub">
        Ontor scores stress, energy, confidence and fatigue from how your voice sounds. If you
        accept, they see how those move against your own usual, including your history so far.
        They never hear what you said: no recordings, no transcripts, no words. You can stop any
        time.
      </p>

      {sp.err && <p className="fmsg err">{sp.err}</p>}

      {session ? (
        <form action={accept}>
          <button className="btn" type="submit">Accept and start sharing</button>
          <p className="fhint" style={{ marginTop: 10 }}>Signed in as {session.email}.</p>
        </form>
      ) : (
        <>
          <Link className="btn" href={`/login/?next=${encodeURIComponent(`/share/${token}/`)}`}>
            Sign in to accept
          </Link>
          <p className="fhint" style={{ marginTop: 10 }}>
            We will email you a six-digit code. If you are new, that is all it takes to create your
            account.
          </p>
        </>
      )}

      <p className="fhint" style={{ marginTop: 22 }}>
        New here? After accepting, <Link href="/install/">install Ontor</Link> and speak to it a
        few times so there is something to see.
      </p>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="acceptWrap">
      <div className="acceptCard">
        <div className="eyebrow" style={{ padding: 0, color: "#0F766E" }}>Ontor</div>
        <h1>{title}</h1>
        {children}
      </div>
    </main>
  );
}
