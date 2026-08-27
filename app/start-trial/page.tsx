// /start-trial — kept as an alias.
//
// The trial itself is started by the subscription page, from the
// server's own record of whether anyone has ever had access. Deciding
// there rather than here means no route, redirect or query parameter
// can lose the intent on the way.
//
// This still exists because links to it are already in the wild, and
// because "start-trial" is a URL people type.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StartTrial() {
  redirect("/dashboard/subscription/");
}
