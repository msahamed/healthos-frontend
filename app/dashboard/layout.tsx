// Dashboard shell: the left rail, and the session gate for everything
// under /dashboard. Putting the redirect here means no child page can
// forget it.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import SignOut from "./sign-out";
import DashboardNav from "./dashboard-nav";
import "./dashboard.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Ontor",
  robots: { index: false, follow: false },
};

function initials(email: string): string {
  return (email.split("@")[0] ?? email)
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  return (
    <div className="shell">
      <aside className="rail">
        <div className="mark">
          <span className="glyph">
            <span>
              <i style={{ height: 5 }} />
              <i style={{ height: 11 }} />
              <i style={{ height: 7 }} />
            </span>
          </span>
          <span className="wordmark">Ontor</span>
        </div>

        <DashboardNav />

        <div className="whoami">
          <span className="avatar">{initials(session.email)}</span>
          <div>
            <b>{session.email.split("@")[0]}</b>
            <small>{session.email}</small>
          </div>
        </div>
        <SignOut />
      </aside>

      <main>{children}</main>
    </div>
  );
}
