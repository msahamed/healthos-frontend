// Base layout/typography shared by every /install/* page: wrap width,
// the light breadcrumb+badge header, the platform card (ios/android),
// step list, gate/warn banners, and the footer. Carried over from the
// original single-page /install (in-* classes), renamed inst-*.
// Each page appends its own small, page-specific block on top of this.

export const INSTALL_SHARED_CSS = `
.inst-wrap { max-width: 1020px; margin: 0 auto; padding: 0 32px; }

.inst-crumb { padding: 22px 32px 0; }
.inst-crumb a { color: var(--ink-soft); text-decoration: none; font-weight: 600; font-size: 13px; }
.inst-crumb a:hover { color: var(--ink); }

.inst-badge {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
  text-transform: uppercase; border-radius: 999px; padding: 3px 11px;
}
.inst-badge.is-live { color: #fff; background: var(--teal); }
.inst-badge.is-locked { color: var(--ink-soft); border: 1px solid var(--line-strong); background: transparent; }
.inst-badge.is-soon { color: var(--ink-soft); border: 1px dashed var(--line-strong); background: transparent; }

.inst-header { padding: 26px 32px 8px; text-align: center; }
.inst-header h1 { font-size: clamp(26px, 3.6vw, 34px); margin: 14px 0 0; color: var(--ink); }
.inst-header p { margin: 10px auto 0; max-width: 480px; color: var(--ink-soft); font-size: 15px; line-height: 1.6; }

.inst-body { background: var(--paper-3); padding: 8px 0 72px; }
.inst-card {
  border: 1px solid var(--line); border-radius: 16px; background: #fff;
  padding: 28px 28px 26px; margin: 24px 0;
}
.inst-card h2 {
  margin: 0 0 10px; font-size: clamp(24px, 3vw, 28px); font-weight: 700;
  color: var(--ink); letter-spacing: -0.015em;
}
.inst-card > p.inst-note-wide { margin: 0 0 18px; font-size: 14.5px; line-height: 1.6; color: var(--ink-soft); max-width: 70ch; }

.inst-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 36px; align-items: start; }
.inst-col:first-child { border-right: 1px solid var(--line); padding-right: 36px; }
.inst-col h3 {
  margin: 0 0 10px; font-size: 12.5px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--teal);
}
.inst-note { margin: 0 0 16px; font-size: 14.5px; line-height: 1.6; color: var(--ink-soft); }

.inst-steps { margin: 0; padding: 0; list-style: none; counter-reset: step; }
.inst-steps li { counter-increment: step; margin-bottom: 16px; font-size: 15px; line-height: 1.6; color: var(--ink-soft); }
.inst-steps li::before {
  content: "Step " counter(step); display: table; margin-bottom: 5px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: #B45309; background: var(--amber-soft); border: 1px solid var(--amber-border);
  border-radius: 999px; padding: 2px 10px;
}
.inst-steps li:last-child { margin-bottom: 0; }
.inst-steps strong { color: var(--ink); }
.inst-link { color: var(--teal); font-weight: 600; text-decoration: none; word-break: break-all; }
.inst-link:hover { text-decoration: underline; }
.inst-locked { color: var(--ink-soft); font-style: italic; }

.inst-gate {
  border: 1px solid var(--line-strong); background: #fff; border-radius: 12px;
  padding: 14px 18px; margin: 24px 0; font-size: 14.5px; line-height: 1.6; color: var(--ink-soft);
}
.inst-gate a { color: var(--teal); font-weight: 600; }
.inst-email { color: var(--teal); overflow-wrap: break-word; }
.inst-warn {
  margin-top: 18px; border: 1px solid #E8D9B8; background: #FBF6E9; border-radius: 12px;
  padding: 13px 16px; font-size: 14px; line-height: 1.6; color: #6B5A2E;
}
.inst-help { text-align: center; margin-top: 12px; font-size: 15px; color: var(--ink-soft); }

.inst-foot { border-top: 1px solid var(--line); padding: 32px 0 48px; background: var(--paper); }
.inst-foot-inner { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.inst-foot-brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: var(--ink); }
.inst-foot-links { display: flex; gap: 22px; font-size: 14px; color: var(--ink-soft); }
.inst-foot-links a { color: inherit; text-decoration: none; transition: color .15s; }
.inst-foot-links a:hover { color: var(--ink); }

@media (max-width: 720px) {
  .inst-cols { grid-template-columns: 1fr; gap: 28px 0; }
  .inst-col:first-child { border-right: none; padding-right: 0; border-bottom: 1px solid var(--line); padding-bottom: 28px; }
}
@media (max-width: 560px) {
  .inst-wrap { padding: 0 20px; }
  .inst-card { padding: 22px 18px 20px; }
}
`;
