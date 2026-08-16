// /dashboard/profile — edit the person behind the account.
//
// A server action rather than an API route: the form posts straight to
// the server, the session comes from the cookie, and there is no
// client-side fetch or extra endpoint to secure. It also works with
// JavaScript disabled, which costs nothing here.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import { getProfile, saveProfile, SEX_OPTIONS } from "@/lib/profile";
import { endShare, grantToCoach, listForClient } from "@/lib/shares";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile — Ontor",
  robots: { index: false, follow: false },
};

const SEX_LABEL: Record<string, string> = {
  female: "Female",
  male: "Male",
  intersex: "Intersex",
  prefer_not_to_say: "Prefer not to say",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string; shared?: string; serr?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const [profile, granted, params] = await Promise.all([
    getProfile(session.userId),
    listForClient(session),
    searchParams,
  ]);

  async function save(formData: FormData) {
    "use server";
    const s = await getSessionFromCookies();
    if (!s) redirect("/login");

    const errors = await saveProfile(s.userId, {
      fullName: String(formData.get("fullName") ?? ""),
      dob: String(formData.get("dob") ?? ""),
      sexAtBirth: String(formData.get("sexAtBirth") ?? ""),
    });

    if (Object.keys(errors).length) {
      const first = Object.values(errors)[0]!;
      redirect(`/dashboard/profile?err=${encodeURIComponent(first)}`);
    }
    // The roster and the client header both read the name.
    revalidatePath("/dashboard");
    redirect("/dashboard/profile?saved=1");
  }

  /**
   * Start sharing with a coach.
   *
   * Active immediately, with nothing for them to accept: you do not
   * need anyone's permission to hand over your own numbers. If they
   * have no account yet the row waits, invisible, until they sign in.
   */
  async function startSharing(formData: FormData) {
    "use server";
    const s = await getSessionFromCookies();
    if (!s) redirect("/login");
    const res = await grantToCoach(s, String(formData.get("coachEmail") ?? ""));
    if (!res.ok) redirect(`/dashboard/profile?serr=${encodeURIComponent(res.error)}`);
    revalidatePath("/dashboard/profile");
    redirect(`/dashboard/profile?shared=${res.coachHasAccount ? "1" : "pending"}`);
  }

  async function stopSharing(formData: FormData) {
    "use server";
    const s = await getSessionFromCookies();
    if (!s) redirect("/login");
    await endShare(s, String(formData.get("id") ?? ""));
    revalidatePath("/dashboard/profile");
    redirect("/dashboard/profile");
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Profile</h1>
          <p className="sub">
            Signed in as {session.email}. Everything here is optional.
          </p>
        </div>
      </div>

      <form action={save} className="card formcard">
        <label className="field">
          <span className="flabel">Name</span>
          <input
            name="fullName"
            defaultValue={profile.fullName ?? ""}
            maxLength={80}
            placeholder="What should we call you?"
            autoComplete="name"
          />
          <span className="fhint">Used instead of your email address across the dashboard.</span>
        </label>

        <label className="field">
          <span className="flabel">Date of birth</span>
          <input type="date" name="dob" defaultValue={profile.dob ?? ""} max="2026-12-31" />
          <span className="fhint">Voice changes with age, so this sharpens your baseline.</span>
        </label>

        <label className="field">
          <span className="flabel">Sex at birth</span>
          <select name="sexAtBirth" defaultValue={profile.sexAtBirth ?? ""}>
            <option value="">Not set</option>
            {SEX_OPTIONS.map((o) => (
              <option key={o} value={o}>{SEX_LABEL[o]}</option>
            ))}
          </select>
          <span className="fhint">
            Vocal pitch ranges differ, so this helps read your voice against the right norms. Leave
            it unset if you would rather not say.
          </span>
        </label>

        {params.err && <p className="fmsg err">{params.err}</p>}
        {params.saved && <p className="fmsg ok">Saved.</p>}

        <button className="btn" type="submit">Save profile</button>
      </form>

      <section className="sect" style={{ maxWidth: 520 }}>
        <h2 className="sectTitle">Who can see your check-ins</h2>
        <p className="sub">
          They see how your voice moves against your own usual. They never see or hear what you
          said. Stop any of them at any time, and it takes effect immediately.
        </p>
        {params.shared === "1" && <p className="fmsg ok">Sharing started. They can see it now.</p>}
        {params.shared === "pending" && (
          <p className="fmsg ok">
            Sharing started. They do not have an Ontor account yet, so nothing is visible to them
            until they sign in with that address.
          </p>
        )}
        {params.serr && <p className="fmsg err">{params.serr}</p>}

        <form action={startSharing} className="inviteform" style={{ marginBottom: 14 }}>
          <input
            type="email"
            name="coachEmail"
            required
            placeholder="coach@example.com"
            aria-label="Coach email"
          />
          <button className="btn" type="submit">Share with a coach</button>
        </form>
        <div className="card">
          {granted.length === 0 ? (
            <p className="fhint" style={{ margin: 0 }}>
              Nobody. You are not sharing your check-ins with anyone.
            </p>
          ) : (
            <ul className="shares" style={{ padding: 0 }}>
              {granted.map((g) => (
                <li key={g.id}>
                  <span>
                    <b>{g.coachEmail}</b>
                    <small>
                      {g.status === "active"
                        ? `sharing since ${(g.acceptedAt ?? g.createdAt).toISOString().slice(0, 10)}`
                        : "invited you, not accepted yet"}
                    </small>
                  </span>
                  <form action={stopSharing}>
                    <input type="hidden" name="id" value={g.id} />
                    <button className="linkbtn" type="submit">
                      {g.status === "active" ? "Stop sharing" : "Decline"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
