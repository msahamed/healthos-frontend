// Shared ?email= handling for the install flow. The chooser forwards
// whatever email it was opened with to every platform tile; the gated
// platform pages (ios/android) read it back out to run the invite check.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

/** Pulls a validated, lowercased email out of a page's ?email= param, or null. */
export async function extractEmail(
  searchParams: SearchParams,
): Promise<string | null> {
  const raw = (await searchParams).email;
  return typeof raw === "string" && EMAIL_RE.test(raw.trim())
    ? raw.trim().toLowerCase()
    : null;
}

/** Appends ?email= to a path when present, otherwise returns it unchanged. */
export function withEmail(path: string, email: string | null): string {
  return email ? `${path}?email=${encodeURIComponent(email)}` : path;
}
