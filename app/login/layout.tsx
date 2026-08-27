import type { Metadata } from "next";

// Client pages can't export `metadata`, so the tab title/description for
// /login live here. Not indexed — it's a functional auth screen, not
// content.
export const metadata: Metadata = {
  title: "Sign in — Ontor",
  description: "Sign in to Ontor with a one-time code sent to your email. No password.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
