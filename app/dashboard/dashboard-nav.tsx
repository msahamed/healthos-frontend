"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function current(pathname: string, href: string): "page" | undefined {
  if (href === "/dashboard") return pathname === href ? "page" : undefined;
  return pathname.startsWith(href) ? "page" : undefined;
}

export default function DashboardNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isMemberDetail = segments.length === 2 && !["profile", "subscription", "team"].includes(segments[1] ?? "");
  return <>
    <div className="navlabel">Personal</div>
    <nav className="nav" aria-label="Personal">
      <Link href="/dashboard" aria-current={current(pathname, "/dashboard")}>
        <svg viewBox="0 0 24 24"><path d="M4 19V9l8-5 8 5v10" /><path d="M9 19v-6h6v6" /></svg>
        Overview
      </Link>
      <Link href="/dashboard/profile" aria-current={current(pathname, "/dashboard/profile")}>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.6-3.8 3.3-6 7-6s6.4 2.2 7 6" /></svg>
        Profile
      </Link>
      <Link href="/dashboard/subscription" aria-current={current(pathname, "/dashboard/subscription")}>
        <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2.2" /><path d="M3 10.5h18" /></svg>
        Subscription
      </Link>
    </nav>

    <div className="navlabel teamLabel">Team</div>
    <nav className="nav" aria-label="Team">
      <Link href="/dashboard/team" aria-current={pathname === "/dashboard/team" || isMemberDetail ? "page" : undefined}>
        <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.4-3.2 2.7-5 5.5-5s5.1 1.8 5.5 5" /><path d="M16.5 7.5a3 3 0 0 1 0 5.6" /><path d="M18 18.8c-.2-2-.9-3.4-2-4.3" /></svg>
        Team members
      </Link>
      <Link href="/dashboard/team/sharing" aria-current={current(pathname, "/dashboard/team/sharing")}>
        <svg viewBox="0 0 24 24"><path d="M8 12h8" /><path d="M12 8v8" /><circle cx="12" cy="12" r="9" /></svg>
        Sharing
      </Link>
    </nav>
  </>;
}
