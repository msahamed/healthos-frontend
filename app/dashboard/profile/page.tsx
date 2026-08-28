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
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  const [profile, params] = await Promise.all([
    getProfile(session.userId),
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

    </>
  );
}
