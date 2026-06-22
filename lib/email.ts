// Transactional email for waitlist signups, sent via Resend.
//
// Two emails fire on a NEW signup (see app/api/waitlist/route.ts):
//   1. A welcome email to the person who joined.
//   2. A "someone joined" notification to the founder.
//
// Both are best-effort: failures are logged, never thrown, so email
// trouble can't break the signup itself. Sending is skipped entirely
// when RESEND_API_KEY is absent (e.g. local dev), so nothing is needed
// to run the app without email configured.

import { Resend } from "resend";

const FROM = "HealthOS <hello@healthos.live>";
const OWNER_NOTIFY = "sabbers@gmail.com";
const SITE = "https://healthos.live";

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// ── Welcome email ─────────────────────────────────────────────────────
function welcomeHtml(): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:40px 40px 8px;">
                <img src="${SITE}/email-logo.png" width="44" height="44" alt="HealthOS" style="display:block;width:44px;height:44px;border:0;outline:none;text-decoration:none;" />
                <p style="margin:20px 0 0;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#0d9488;font-weight:600;">HealthOS</p>
                <h1 style="margin:12px 0 0;font-size:26px;line-height:1.25;font-weight:600;color:#111827;">You're on the list.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 0;font-size:16px;line-height:1.6;color:#374151;">
                <p style="margin:0 0 16px;">Thanks for joining the HealthOS early-access list. We're building a voice-first, on-device health agent that notices what you don't &mdash; reading your nervous-system state from how you sound, without a wearable and without your voice ever leaving your phone.</p>
                <p style="margin:0 0 16px;">We'll reach out personally when your spot opens up. In the meantime, here's a little more about what we're building:</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="${SITE}/blog" style="color:#0d9488;text-decoration:none;font-weight:600;font-size:16px;">&rarr; Read the blog</a>
                      <div style="font-size:14px;color:#6b7280;margin-top:2px;">How voice biomarkers work, and why we built this.</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="${SITE}/about" style="color:#0d9488;text-decoration:none;font-weight:600;font-size:16px;">&rarr; About HealthOS</a>
                      <div style="font-size:14px;color:#6b7280;margin-top:2px;">The mission and the approach to privacy.</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="https://www.linkedin.com/in/sabber-ahamed/" style="color:#0d9488;text-decoration:none;font-weight:600;font-size:16px;">&rarr; Meet the founder</a>
                      <div style="font-size:14px;color:#6b7280;margin-top:2px;">Sabber Ahamed &mdash; say hi on LinkedIn.</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px;">
                <p style="margin:0;font-size:16px;line-height:1.6;color:#374151;">Talk soon,<br/>Sabber &amp; the HealthOS team</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">You're receiving this because you joined the waitlist at <a href="${SITE}" style="color:#9ca3af;">healthos.live</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function welcomeText(): string {
  return [
    "You're on the list.",
    "",
    "Thanks for joining the HealthOS early-access list. We're building a",
    "voice-first, on-device health agent that notices what you don't —",
    "reading your nervous-system state from how you sound, without a",
    "wearable and without your voice ever leaving your phone.",
    "",
    "We'll reach out personally when your spot opens up. In the meantime:",
    "",
    `  • Read the blog:      ${SITE}/blog`,
    `  • About HealthOS:     ${SITE}/about`,
    "  • Meet the founder:   https://www.linkedin.com/in/sabber-ahamed/",
    "",
    "Talk soon,",
    "Sabber & the HealthOS team",
  ].join("\n");
}

/** Welcome the new signup. No-op (logged) if Resend isn't configured. */
export async function sendWelcomeEmail(to: string): Promise<void> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY missing — skipping welcome email");
    return;
  }
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to,
      subject: "Welcome to HealthOS — you're on the list",
      html: welcomeHtml(),
      text: welcomeText(),
    });
    if (error) console.error("[email] welcome send failed:", error);
  } catch (err) {
    console.error("[email] welcome threw:", err);
  }
}

/** Notify the founder that someone new joined. */
export async function sendOwnerNotification(
  signupEmail: string,
  meta: { source: string; feedback: string | null },
): Promise<void> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY missing — skipping owner notification");
    return;
  }
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to: OWNER_NOTIFY,
      replyTo: signupEmail,
      subject: `🎉 New waitlist signup: ${signupEmail}`,
      text: [
        "Someone just joined the HealthOS waitlist.",
        "",
        `Email:    ${signupEmail}`,
        `Source:   ${meta.source}`,
        `Feedback: ${meta.feedback ?? "—"}`,
      ].join("\n"),
    });
    if (error) console.error("[email] owner notify failed:", error);
  } catch (err) {
    console.error("[email] owner notify threw:", err);
  }
}
