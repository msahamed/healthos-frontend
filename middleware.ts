import { NextRequest, NextResponse } from "next/server";

/**
 * Rebrand redirect: healthos.live → ontor.ai
 *
 * Runs on the shared Vercel deployment (both domains point at this project).
 * - If the request host is the OLD domain (healthos.live / www.healthos.live),
 *   permanently (308) redirect the same path to ontor.ai. This transfers SEO /
 *   link equity from healthos.live to ontor.ai and removes the duplicate.
 * - It never redirects `/api/*` — the mobile app has `https://healthos.live/api/v1`
 *   hardcoded in installed test builds, so that path MUST keep serving on
 *   healthos.live. (The matcher below also excludes /api as a second guard.)
 * - On ontor.ai (and *.vercel.app / localhost) this is a no-op.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();

  const isOldDomain = host === "healthos.live" || host === "www.healthos.live";
  if (!isOldDomain) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // Mobile safety: never redirect the API. Existing installs depend on it.
  if (pathname.startsWith("/api")) return NextResponse.next();

  const target = new URL(`https://ontor.ai${pathname}${search}`);
  return NextResponse.redirect(target, 308);
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
