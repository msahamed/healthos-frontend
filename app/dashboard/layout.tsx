// Dashboard shell: the left rail, and the session gate for everything
// under /dashboard. Putting the redirect here means no child page can
// forget it.

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";
import SignOut from "./sign-out";
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

        <div className="navlabel">Coaching</div>
        <nav className="nav">
          <Link href="/dashboard" aria-current="page">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="8" r="3.2" />
              <path d="M3.5 19c.4-3.2 2.7-5 5.5-5s5.1 1.8 5.5 5" />
              <path d="M16.5 7.5a3 3 0 0 1 0 5.6" />
              <path d="M18 18.8c-.2-2-.9-3.4-2-4.3" />
            </svg>
            Clients
          </Link>
          <Link href="/dashboard/profile">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 20c.6-3.8 3.3-6 7-6s6.4 2.2 7 6" />
            </svg>
            Profile
          </Link>
        </nav>

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
