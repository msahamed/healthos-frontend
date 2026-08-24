// Lifecycle email: trial, subscription, cancellation.
//
// ALL of it comes from us, not from Stripe. Stripe can send its own
// receipts, but a customer who gets some messages from Stripe and
// others from Ontor is being talked to by two different companies.
// One sender, one voice. Stripe keeps only the things it is genuinely
// better at — the invoice PDF and the failed-card retry sequence, both
// reachable from the billing portal.
//
// Sending is best-effort everywhere it is called. A webhook that threw
// because an email bounced would make Stripe retry a payment event
// that already succeeded, and the customer would be charged correctly
// but recorded as failing. Access is the important part; the email is
// a courtesy on top.

import { Resend } from "resend";

const FROM = "Ontor <hello@ontor.ai>";
const SITE = "https://ontor.ai";
const MANAGE = `${SITE}/dashboard/subscription/`;
const PRICING = `${SITE}/pricing/`;

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function longDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** The house shell, so six emails cannot drift into six designs. */
function shell(opts: {
  heading: string;
  paragraphs: string[];
  cta?: { label: string; href: string };
  footnote?: string;
}): string {
  const body = opts.paragraphs
    .map((p) => `<p style="margin:0 0 16px;">${p}</p>`)
    .join("");
  const cta = opts.cta
    ? `<tr><td style="padding:8px 40px 0;">
            <a href="${opts.cta.href}" style="display:inline-block;background:#0F766E;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:13px 26px;border-radius:12px;">${opts.cta.label}</a>
          </td></tr>`
    : "";
  const foot = opts.footnote
    ? `<tr><td style="padding:28px 40px 40px;">
            <p style="margin:0;font-size:13px;color:#9ca3af;">${opts.footnote}</p>
          </td></tr>`
    : `<tr><td style="padding:28px 40px 40px;"></td></tr>`;

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr><td style="padding:38px 40px 0;">
            <p style="margin:0;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#0d9488;font-weight:600;">Ontor</p>
            <h1 style="margin:16px 0 0;font-size:26px;line-height:1.25;font-weight:600;color:#111827;">${opts.heading}</h1>
          </td></tr>
          <tr><td style="padding:20px 40px 0;font-size:16px;line-height:1.6;color:#374151;">${body}</td></tr>
          ${cta}
          ${foot}
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

async function send(
  to: string,
  subject: string,
  html: string,
  text: string[],
): Promise<void> {
  const client = getResend();
  if (!client) return; // No key in local dev. Not an error.
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: text.join("\n"),
    });
    if (error) console.error("[billing-email]", subject, error.message);
  } catch (err) {
    console.error("[billing-email]", subject, err);
  }
}

// ── Trial ─────────────────────────────────────────────────────────

export async function sendTrialStarted(to: string, endsAt: Date, days: number) {
  const ends = longDate(endsAt);
  await send(
    to,
    `Your Ontor trial is running`,
    shell({
      heading: "You're in.",
      paragraphs: [
        `You have ${days} days of full access, through ${ends}. No card, nothing to cancel.`,
        `One thing worth knowing: Ontor gets better the longer it listens. The first few sessions build your baseline, and the patterns only start meaning something once there is one. Use it a few times this week and it will have something real to tell you.`,
        // Said now, on purpose. Someone who first meets the price on day
        // eleven has spent the whole trial judging the product without
        // knowing what it costs, and then gets a surprise at the worst
        // possible moment.
        `After that it is $20 a month, or $168 for the year. Nothing happens automatically — we have no card.`,
      ],
      footnote: "Questions? Just reply to this email.",
    }),
    [
      "You're in.",
      "",
      `You have ${days} days of full access, through ${ends}. No card, nothing to cancel.`,
      "",
      "Ontor gets better the longer it listens. The first few sessions build your baseline.",
      "",
      "After that it is $20 a month, or $168 for the year. Nothing happens automatically.",
    ],
  );
}

export interface TrialUsage {
  sessions: number;
  days: number;
}

/**
 * The middle paragraph, which is the whole email.
 *
 * Somebody who used it has built a baseline and would be starting the
 * measurement over; say so with their own numbers. Somebody who did not
 * has nothing to lose yet, and telling them what they built would be
 * both false and slightly insulting — they get an honest nudge instead.
 */
function usageLine(u: TrialUsage): string {
  if (u.sessions >= 5) {
    const s = `${u.sessions} check-in${u.sessions === 1 ? "" : "s"}`;
    const d = `${u.days} day${u.days === 1 ? "" : "s"}`;
    return `You have recorded ${s} across ${d}. That is enough for Ontor to know your usual range, which means everything it tells you now is measured against how <em>you</em> actually sound rather than an average of strangers. That is the part that took two weeks to build, and the part you would be starting over on later.`;
  }
  if (u.sessions > 0) {
    return `You have recorded ${u.sessions} check-in${u.sessions === 1 ? "" : "s"} so far. A few more and Ontor has enough to know your usual range, which is when the readings stop being numbers and start being about you.`;
  }
  return `You have not had a chance to use it yet. It takes about a minute: talk to Ontor a few times and it starts learning what your usual sounds like. That is worth doing before the clock runs out.`;
}

export async function sendTrialEnding(
  to: string,
  endsAt: Date,
  daysLeft: number,
  usage: TrialUsage = { sessions: 0, days: 0 },
) {
  const ends = longDate(endsAt);
  const n = `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
  await send(
    to,
    `${n} left on your Ontor trial`,
    shell({
      heading: `${n} left`,
      paragraphs: [
        `Your trial ends on ${ends}.`,
        usageLine(usage),
        `$20 a month, or $168 for the year.`,
      ],
      cta: { label: "Keep your access", href: PRICING },
      footnote: "If you would rather not continue, do nothing. It stops on its own.",
    }),
    [
      `${n} left on your Ontor trial.`,
      "",
      `Your trial ends on ${ends}.`,
      usageLine(usage).replace(/<[^>]+>/g, ""),
      "",
      "$20 a month, or $168 for the year.",
      PRICING,
    ],
  );
}

export async function sendTrialEnded(
  to: string,
  usage: TrialUsage = { sessions: 0, days: 0 },
) {
  const built =
    usage.sessions >= 5
      ? `Your ${usage.sessions} check-ins and the baseline built from them are still here. Nothing has been deleted, and picking up where you left off takes one click.`
      : `Your readings are still here. Nothing has been deleted, and picking up where you left off takes one click.`;
  await send(
    to,
    "Your Ontor trial has ended",
    shell({
      heading: "Your trial has ended.",
      paragraphs: [
        built,
        `$20 a month, or $168 for the year.`,
      ],
      cta: { label: "Continue with Ontor", href: PRICING },
      footnote: "Not for you right now? No hard feelings. Your data stays put.",
    }),
    [
      "Your Ontor trial has ended.",
      "",
      "Your readings and your baseline are still here.",
      "$20 a month, or $168 for the year.",
      "",
      PRICING,
    ],
  );
}

// ── Subscription ──────────────────────────────────────────────────

export async function sendSubscribed(to: string, renewsAt: Date | null) {
  const renews = longDate(renewsAt);
  await send(
    to,
    "You're subscribed to Ontor",
    shell({
      heading: "You're subscribed.",
      paragraphs: [
        renews
          ? `Your subscription is active and renews on ${renews}.`
          : `Your subscription is active.`,
        `Open Ontor and it will pick this up on its own. Invoices, payment method and cancellation all live on your subscription page.`,
      ],
      cta: { label: "Your subscription", href: MANAGE },
      footnote: "Thank you. Genuinely.",
    }),
    [
      "You're subscribed to Ontor.",
      "",
      renews ? `Active, renews ${renews}.` : "Your subscription is active.",
      "",
      MANAGE,
    ],
  );
}

export async function sendCancelled(to: string, accessUntil: Date | null) {
  const until = longDate(accessUntil);
  await send(
    to,
    "Your Ontor subscription is cancelled",
    shell({
      heading: "Cancelled.",
      paragraphs: [
        until
          ? `You keep full access until ${until}, which is what you have already paid for. It will not renew after that.`
          : `Your subscription will not renew.`,
        `Your readings stay where they are either way.`,
        `If you change your mind before then, restarting takes one click and nothing is lost.`,
      ],
      cta: { label: "Your subscription", href: MANAGE },
      footnote: "If something was wrong with it, reply and tell me. I read these.",
    }),
    [
      "Your Ontor subscription is cancelled.",
      "",
      until ? `You keep access until ${until}. It will not renew after that.` : "It will not renew.",
      "",
      MANAGE,
    ],
  );
}

export async function sendSubscriptionEnded(to: string) {
  await send(
    to,
    "Your Ontor subscription has ended",
    shell({
      heading: "Your subscription has ended.",
      paragraphs: [
        `Access has stopped, but nothing has been deleted. Your readings and your baseline are still here whenever you want them.`,
      ],
      cta: { label: "Start again", href: PRICING },
    }),
    [
      "Your Ontor subscription has ended.",
      "",
      "Nothing has been deleted. Your readings and baseline are still here.",
      "",
      PRICING,
    ],
  );
}
