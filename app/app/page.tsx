// /app — the signed-in surface. Deliberately empty for now.
//
// This is step one of the web dashboard: prove that sign-in works
// end to end on the web and that a session gates a page. Content
// comes next, and the plan is analytics only — marker patterns
// against a personal baseline, never individual check-ins and never
// transcripts.
//
// Rendered on demand rather than statically: it reads a cookie, so
// there is nothing to prerender.

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ontor",
  robots: { index: false, follow: false },
};

export default async function AppPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/login");

  return <main style={{ minHeight: "100vh", background: "var(--paper)" }} />;
}
