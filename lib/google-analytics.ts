import { createHash } from "node:crypto";

const DEFAULT_MEASUREMENT_ID = "G-YK3M9ZE2MS";

type EventParam = string | number | boolean;

interface ProductEvent {
  name: string;
  userId: string;
  occurredAt?: Date | null;
  params?: Record<string, EventParam | null | undefined>;
}

function stableClientId(userId: string) {
  const digest = createHash("sha256").update(userId).digest();
  return `${digest.readUInt32BE(0)}.${digest.readUInt32BE(4)}`;
}

/**
 * Send native-app lifecycle events into the same GA4 property as the website.
 * Disabled until GA_API_SECRET is configured in the deployment environment.
 */
export async function sendGoogleAnalyticsProductEvent({
  name,
  userId,
  occurredAt,
  params = {},
}: ProductEvent): Promise<boolean> {
  const apiSecret =
    process.env.GA_API_SECRET ?? process.env.ga_funnel_secrect_API_key;
  if (!apiSecret) return false;

  const measurementId =
    process.env.GA_MEASUREMENT_ID ?? DEFAULT_MEASUREMENT_ID;
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, EventParam] => {
      const value = entry[1];
      return value !== null && value !== undefined;
    }),
  );

  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", measurementId);
  endpoint.searchParams.set("api_secret", apiSecret);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: stableClientId(userId),
        user_id: userId,
        timestamp_micros: String(
          (occurredAt ?? new Date()).getTime() * 1_000,
        ),
        events: [
          {
            name,
            params: {
              engagement_time_msec: 1,
              ...cleanParams,
            },
          },
        ],
      }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.error(`[ga] ${name} rejected with ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[ga] ${name} failed:`, error);
    return false;
  }
}
