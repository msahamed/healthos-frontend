// /start-trial — kept as an alias.
//
// Trials now start only after the signed-in user presses the explicit button
// on the subscription page. This alias remains for older links.
//
// This still exists because links to it are already in the wild, and
// because "start-trial" is a URL people type.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StartTrial() {
  redirect("/dashboard/subscription/");
}
