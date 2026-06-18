// POST /api/v1/voice/presign-batch — mint short-lived S3 GET URLs for a
// whole set of voice clips in one call. Used by restore-from-email: a
// fresh install pulls all its clips back down with a single round-trip,
// then downloads each one DIRECT from S3 (the backend never streams the
// audio — it only signs).
//
// Same key scheme + auth model as the single PUT/GET presign:
//   key  = `<S3_VOICE_PREFIX><user_id>/<observation_id>.wav`
//   auth = `user_id` IS the bearer (random UUIDv4, not enumerable).
//
// Body: { user_id, observation_ids: string[] }
// Response: { urls: { <observation_id>: <signedUrl> }, expires_at }
// Unknown / malformed ids are simply omitted from `urls` rather than
// failing the batch; a 404 on download (clip never uploaded) is handled
// client-side.

import { NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const URL_TTL_SECONDS = 15 * 60;
const MAX_IDS = 200;

let _s3: S3Client | null = null;
function getS3(): S3Client {
  if (_s3) return _s3;
  const region = process.env.AWS_REGION;
  if (!region) throw new Error("AWS_REGION not configured");
  _s3 = new S3Client({ region, requestChecksumCalculation: "WHEN_REQUIRED" });
  return _s3;
}

interface BatchBody {
  user_id?: string;
  observation_ids?: unknown;
}

export async function POST(req: Request) {
  const bucket = process.env.S3_VOICE_BUCKET;
  if (!bucket) {
    console.error("[voice/presign-batch] S3_VOICE_BUCKET not configured");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  let body: BatchBody;
  try {
    body = (await req.json()) as BatchBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const userId = typeof body.user_id === "string" ? body.user_id : "";
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "user_id_required" }, { status: 400 });
  }

  const rawIds = Array.isArray(body.observation_ids)
    ? body.observation_ids
    : null;
  if (!rawIds) {
    return NextResponse.json(
      { error: "observation_ids_required" },
      { status: 400 },
    );
  }
  if (rawIds.length > MAX_IDS) {
    return NextResponse.json(
      { error: "batch_too_large", limit: MAX_IDS },
      { status: 413 },
    );
  }

  // Dedupe + keep only well-formed uuids; bad ones are dropped silently.
  const ids = [
    ...new Set(
      rawIds.filter(
        (x): x is string => typeof x === "string" && UUID_RE.test(x),
      ),
    ),
  ];

  const rawPrefix = process.env.S3_VOICE_PREFIX ?? "observations/";
  const prefix = rawPrefix.replace(/^\/+/, "").replace(/\/*$/, "/");

  try {
    const entries = await Promise.all(
      ids.map(async (id) => {
        const key = `${prefix}${userId}/${id}.wav`;
        const signedUrl = await getSignedUrl(
          getS3(),
          new GetObjectCommand({ Bucket: bucket, Key: key }),
          { expiresIn: URL_TTL_SECONDS },
        );
        return [id, signedUrl] as const;
      }),
    );

    const urls: Record<string, string> = {};
    for (const [id, signedUrl] of entries) urls[id] = signedUrl;

    const expiresAt = new Date(
      Date.now() + URL_TTL_SECONDS * 1000,
    ).toISOString();
    return NextResponse.json({ urls, expires_at: expiresAt });
  } catch (err) {
    console.error("[voice/presign-batch] sign failed", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
