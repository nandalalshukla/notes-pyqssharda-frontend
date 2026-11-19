import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthStatus, safeReturnTo } from "@/lib/server/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Dashboard",
  description: "Manage your profile and contributions.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const status = await getServerAuthStatus();
  if (status === "unavailable") {
    throw new Error("Authentication service is temporarily unavailable.");
  }
  if (status !== "authenticated") {
    const requestHeaders = await headers();
    const returnTo = safeReturnTo(requestHeaders.get("x-app-pathname") || "/library/dashboard");
    redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  }
  return <>{children}</>;
}
