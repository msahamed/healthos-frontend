import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthOS — Your health records, privately on-device",
  description:
    "HealthOS gives you a single private place to collect, understand, and control your lifetime health records. AI-powered insights, fully on-device.",
  openGraph: {
    title: "HealthOS",
    description: "Your health records, privately on-device",
    url: "https://healthos.live",
    siteName: "HealthOS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
