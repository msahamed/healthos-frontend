"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function current(pathname: string, href: string): "page" | undefined {
  if (href === "/dashboard") return pathname === href ? "page" : undefined;
  return pathname.startsWith(href) ? "page" : undefined;
}

export default function DashboardNav() {
  const pathname = usePathname();
  return <>
    <div className="navlabel">Personal</div>
    <nav className="nav" aria-label="Personal">
      <Link href="/dashboard" aria-current={current(pathname, "/dashboard")}>
        <svg viewBox="0 0 24 24"><path d="M4 19V9l8-5 8 5v10" /><path d="M9 19v-6h6v6" /></svg>
        Overview
      </Link>
      <Link href="/install/">
        <svg viewBox="0 0 24 24"><path d="M12 3v11" /><path d="m7.5 10 4.5 4.5 4.5-4.5" /><path d="M4 19h16" /></svg>
        Install
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

  </>;
}
