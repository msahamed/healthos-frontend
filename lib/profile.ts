// The person behind an account: name, date of birth, sex at birth.
//
// Stored on the existing `profiles` collection, keyed by user_id, next
// to the speaker voiceprint the app already syncs there. Both writers
// use $set on their own fields, so neither clobbers the other — the
// app can enroll a voiceprint while the web edits a name.
//
// These have lived only on the device until now (owner_full_name,
// owner_dob_iso, owner_sex_at_birth in OwnerProfileService), which
// means they were lost on reinstall and invisible to a coach. Putting
// them here is what lets the dashboard say "Rhoni" instead of guessing
// a name out of an email address.
//
// Sex at birth is optional and offers a decline. It is here because
// voice norms differ, not as an identity field, and a blank is a
// perfectly good answer.

import { getDb } from "@/lib/auth";

export const SEX_OPTIONS = ["female", "male", "intersex", "prefer_not_to_say"] as const;
export type SexAtBirth = (typeof SEX_OPTIONS)[number];

export interface Profile {
  fullName: string | null;
  dob: string | null; // ISO yyyy-mm-dd
  sexAtBirth: SexAtBirth | null;
  updatedAt: Date | null;
}

export const EMPTY_PROFILE: Profile = {
  fullName: null,
  dob: null,
  sexAtBirth: null,
  updatedAt: null,
};


/** Stored shape. `_id` is the user_id UUID, not an ObjectId. */
interface ProfileDoc {
  _id: string;
  full_name?: string | null;
  dob?: string | null;
  sex_at_birth?: string | null;
  updated_at?: Date | null;
}

export async function getProfile(userId: string): Promise<Profile> {
  const db = await getDb();
  const doc = (await db
    .collection<ProfileDoc>("profiles")
    .findOne(
      { _id: userId },
      { projection: { full_name: 1, dob: 1, sex_at_birth: 1, updated_at: 1 } },
    )) as ProfileDoc | null;

  if (!doc) return EMPTY_PROFILE;
  const sex = doc.sex_at_birth;
  return {
    fullName: doc.full_name ?? null,
    dob: doc.dob ?? null,
    sexAtBirth: (SEX_OPTIONS as readonly string[]).includes(sex ?? "")
      ? (sex as SexAtBirth)
      : null,
    updatedAt: doc.updated_at ?? null,
  };
}

/** A display name, falling back to the email local part. */
export function displayName(profile: Profile, email: string): string {
  const name = profile.fullName?.trim();
  if (name) return name;
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((s) => s[0]!.toUpperCase() + s.slice(1))
    .join(" ");
}

export interface ProfileInput {
  fullName: string;
  dob: string;
  sexAtBirth: string;
}

/**
 * Validate and save. Returns a field-keyed error map, empty on success.
 *
 * Every field is optional: someone who wants to set only a name should
 * not be forced to disclose a birth date. An empty value clears the
 * field rather than being rejected.
 */
export async function saveProfile(
  userId: string,
  input: ProfileInput,
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  const name = input.fullName.trim();
  if (name.length > 80) errors.fullName = "Keep it under 80 characters.";

  const dob = input.dob.trim();
  if (dob) {
    const parsed = Date.parse(`${dob}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(parsed)) {
      errors.dob = "Use a real date.";
    } else if (parsed > Date.now()) {
      errors.dob = "That date is in the future.";
    } else if (parsed < Date.parse("1900-01-01T00:00:00Z")) {
      errors.dob = "That date is too far back.";
    }
  }

  const sex = input.sexAtBirth.trim();
  if (sex && !(SEX_OPTIONS as readonly string[]).includes(sex)) {
    errors.sexAtBirth = "Pick one of the options.";
  }

  if (Object.keys(errors).length) return errors;

  const db = await getDb();
  await db.collection<ProfileDoc>("profiles").updateOne(
    { _id: userId },
    {
      // $set only these keys: the voiceprint the app syncs onto the
      // same document must survive a name edit untouched.
      $set: {
        full_name: name || null,
        dob: dob || null,
        sex_at_birth: sex || null,
        updated_at: new Date(),
      },
    },
    { upsert: true },
  );
  return {};
}
