import { getMongoClient } from "@/lib/mongodb";

// Stealth gate shared by /install/ios and /install/android: the
// TestFlight / Play links render ONLY when ?email= matches a waitlist
// doc that has been invited (invited_at set by the cockpit's invite
// sender). Everyone else sees the steps with a "use your invite email"
// placeholder, so a shared or guessed URL leaks nothing joinable.
// Fails closed if the lookup errors. Unchanged from the pre-split
// /install page, just extracted so both platform pages can import it.

export const IOS_LINK = "https://testflight.apple.com/join/JBG3ANFF";
export const ANDROID_LINK =
  "https://play.google.com/apps/internaltest/4701391287312603731";

export async function isInvited(email: string): Promise<boolean> {
  try {
    const client = await getMongoClient();
    const doc = await client
      .db("healthos")
      .collection("waitlist")
      .findOne({ email }, { projection: { invited_at: 1 } });
    return Boolean(doc?.invited_at);
  } catch {
    return false;
  }
}
