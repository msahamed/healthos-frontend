import type { Db } from "mongodb";
import {
  sendOwnerLifecycleNotification,
  type OwnerLifecycleMilestone,
} from "@/lib/email";

interface ClaimedOwnerMilestone {
  milestone: OwnerLifecycleMilestone;
  identityKey: string;
  email?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  userId?: string | null;
  occurredAt?: Date | null;
  trialEndsAt?: Date | null;
  trialDays?: number | null;
}

interface OwnerNotificationClaim {
  _id: string;
  milestone: OwnerLifecycleMilestone;
  identity_key: string;
  created_at: Date;
}

/**
 * Claim then send a milestone once. Mongo's unique `_id` makes concurrent
 * requests and analytics retries safe without another index.
 */
export async function sendClaimedOwnerMilestone(
  db: Db,
  notice: ClaimedOwnerMilestone,
): Promise<boolean> {
  const claimId = `${notice.milestone}:${notice.identityKey}`;
  const claimed = await db
    .collection<OwnerNotificationClaim>("owner_notification_claims")
    .updateOne(
      { _id: claimId },
      {
        $setOnInsert: {
          milestone: notice.milestone,
          identity_key: notice.identityKey,
          created_at: new Date(),
        },
      },
      { upsert: true },
    );

  if (claimed.upsertedCount !== 1) return false;
  await sendOwnerLifecycleNotification(notice);
  return true;
}
