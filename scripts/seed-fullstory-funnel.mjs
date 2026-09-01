const apiKey =
  process.env.FULLSTORY_API_KEY ?? process.env.fs_funnel_secrect_API_key;

if (!apiKey) {
  console.log("[fullstory-seed] skipped: no API key configured");
  process.exit(0);
}

const eventNames = [
  "install_reached_signup",
  "email_verified",
  "onboarding_completed",
  "trial_started",
  "first_check_in",
];

for (const name of eventNames) {
  const response = await fetch("https://api.fullstory.com/v2/events", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `ontor-funnel-schema-v1:${name}`,
    },
    body: JSON.stringify({
      user: { uid: "ontor-analytics-schema-seed" },
      name,
      timestamp: "2026-07-01T12:00:00.000Z",
      properties: { internal_schema_seed: true },
    }),
  });

  if (!response.ok) {
    throw new Error(`[fullstory-seed] ${name} failed with ${response.status}`);
  }
}

console.log("[fullstory-seed] registered five onboarding event names");
