// POST /api/v1/voice/presign — mint a short-lived S3 PUT URL for a
// single voice clip.
//
// The app uploads the .wav directly to S3 with this URL — backend
// never touches the audio bytes. Two reasons that matters:
//
//   1. Vercel function bandwidth is metered + slow for multi-MB
//      bodies; direct-to-S3 is free + fast.
//   2. Keeping audio off the API surface narrows the attack surface
//      and reduces what the backend has to be trusted with.
//
// Key scheme: `<S3_VOICE_PREFIX><install_id>/<observation_id>.wav`
//   - Prefix is configurable so the bucket can mix voice with other
//     observation artifacts. Defaults to `observations/` to match the
//     `s3://<bucket>/observations/` layout we use today.
//   - Partitioned by install_id so a delete-all-my-data is a single
//     S3 prefix delete.
//   - One key per observation; idempotent on retry.
//
// Auth: same model as /api/v1/sync — `install_id` IS the bearer.
// A leaked install_id buys the holder the ability to upload audio
// to *that* install's prefix only (key scheme enforces partitioning).
// Acceptable for v1; revisit when auth lands.

import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_CONTENT_TYPES = new Set(["audio/wav", "audio/x-wav"]);

// 15 minutes is enough for any reasonable upload, short enough that a
// leaked URL is unusable by the next morning.
const URL_TTL_SECONDS = 15 * 60;

// 20 MB cap — a 3–5 second 16 kHz mono PCM wav is ~100 KB, so this is
// generous even for misconfigured recordings. Above this, the client
// is doing something wrong and we'd rather reject than absorb cost.
const MAX_BYTES = 20 * 1024 * 1024;

interface PresignBody {
  install_id?: string;
  observation_id?: string;
  content_type?: string;
  bytes?: number;
}

let _s3: S3Client | null = null;
function getS3(): S3Client {
  if (_s3) return _s3;
  const region = process.env.AWS_REGION;
  if (!region) throw new Error("AWS_REGION not configured");
  // Credentials are picked up from AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
  // in env (Vercel) automatically by the SDK's default provider chain.
  _s3 = new S3Client({ region });
  return _s3;
}

export async function POST(req: Request) {
  const bucket = process.env.S3_VOICE_BUCKET;
  if (!bucket) {
    console.error("[voice/presign] S3_VOICE_BUCKET not configured");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  let body: PresignBody;
  try {
    body = (await req.json()) as PresignBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const installId = typeof body.install_id === "string" ? body.install_id : "";
  const observationId =
    typeof body.observation_id === "string" ? body.observation_id : "";
  const contentType =
    typeof body.content_type === "string" ? body.content_type : "audio/wav";
  const bytes = typeof body.bytes === "number" ? body.bytes : null;

  if (!UUID_RE.test(installId)) {
    return NextResponse.json(
      { error: "install_id_required" },
      { status: 400 },
    );
  }
  if (!UUID_RE.test(observationId)) {
    return NextResponse.json(
      { error: "observation_id_required" },
      { status: 400 },
    );
  }
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "content_type_not_allowed", allowed: [...ALLOWED_CONTENT_TYPES] },
      { status: 400 },
    );
  }
  if (bytes !== null && (bytes <= 0 || bytes > MAX_BYTES)) {
    return NextResponse.json(
      { error: "bytes_out_of_range", max: MAX_BYTES },
      { status: 413 },
    );
  }

  // Normalize the prefix so it always ends in exactly one slash and
  // never starts with one. Defaults to `observations/` to match the
  // current bucket layout. Override via Vercel env var.
  const rawPrefix = process.env.S3_VOICE_PREFIX ?? "observations/";
  const prefix = rawPrefix.replace(/^\/+/, "").replace(/\/*$/, "/");
  const s3Key = `${prefix}${installId}/${observationId}.wav`;

  try {
    const url = await getSignedUrl(
      getS3(),
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        ContentType: contentType,
        // Constrain the signed URL to the declared size if the client
        // provided one. Belt + braces: the bucket policy should also
        // cap object size, but signing it in here means a leaked URL
        // can't be reused for a much larger payload.
        ...(bytes !== null ? { ContentLength: bytes } : {}),
      }),
      { expiresIn: URL_TTL_SECONDS },
    );

    const expiresAt = new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString();

    return NextResponse.json({
      url,
      method: "PUT",
      s3_key: s3Key,
      content_type: contentType,
      expires_at: expiresAt,
    });
  } catch (err) {
    console.error("[voice/presign] sign failed", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
