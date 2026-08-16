// GET /api/v1/dashboard/[clientId]?panel=…&days=…&marker=…
//
// The panels the client view loads on demand. The first paint ships
// day means only; time-of-day, the correlation matrix and recovery are
// each a separate, narrow request made when that panel is actually
// looked at.
//
// The marker chips and the 7/30 toggle inside "Each dial" do NOT come
// here. Those are re-derived in the browser from the day rows already
// on the page, so switching a dial costs nothing.
//
// Authorization matches the page: you may read yourself and, once
// sharing exists, your clients. Anything else is a 404 rather than a
// 403, so this cannot be used to find out which user_ids exist.

import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import {
  getMatrix,
  getRecovery,
  getTimeOfDay,
  isMarker,
  MARKER_KEYS,
} from "@/lib/coach-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGES = new Set([7, 30, 90]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { clientId } = await params;
  if (clientId !== session.userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const panel = url.searchParams.get("panel");
  const days = Number(url.searchParams.get("days") ?? 30);
  if (!RANGES.has(days)) {
    return NextResponse.json({ error: "bad_range" }, { status: 400 });
  }

  try {
    switch (panel) {
      case "tod": {
        const raw = url.searchParams.get("keys")?.split(",") ?? ["confidence"];
        const keys = raw.filter(isMarker).slice(0, 3);
        if (!keys.length) keys.push("confidence");
        return NextResponse.json({ buckets: await getTimeOfDay(session.userId, days, keys) });
      }
      case "matrix":
        return NextResponse.json({
          keys: MARKER_KEYS,
          matrix: await getMatrix(session.userId, days),
        });
      case "recovery": {
        const m = url.searchParams.get("marker");
        return NextResponse.json(
          await getRecovery(session.userId, days, isMarker(m) ? m : "stress"),
        );
      }
      default:
        return NextResponse.json({ error: "unknown_panel" }, { status: 400 });
    }
  } catch (err) {
    console.error("[dashboard panel]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
