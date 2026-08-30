import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

function safeNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const [{ next }, session] = await Promise.all([
    searchParams,
    getSessionFromCookies(),
  ]);

  if (session) redirect(safeNext(next));
  return <LoginClient />;
}
