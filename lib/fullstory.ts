type EventParam = string | number | boolean;

interface ProductEvent {
  name: string;
  userId: string;
  occurredAt?: Date | null;
  idempotencyKey: string;
  params?: Record<string, EventParam | null | undefined>;
}

/** Send native-app lifecycle events to FullStory's server Events API. */
export async function sendFullStoryProductEvent({
  name,
  userId,
  occurredAt,
  idempotencyKey,
  params = {},
}: ProductEvent): Promise<boolean> {
  const apiKey = process.env.FULLSTORY_API_KEY;
  if (!apiKey) return false;

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, EventParam] => {
      const value = entry[1];
      return value !== null && value !== undefined;
    }),
  );

  try {
    const response = await fetch("https://api.fullstory.com/v2/events", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        user: { uid: userId },
        name,
        timestamp: (occurredAt ?? new Date()).toISOString(),
        properties: cleanParams,
      }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.error(`[fullstory] ${name} rejected with ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[fullstory] ${name} failed:`, error);
    return false;
  }
}

