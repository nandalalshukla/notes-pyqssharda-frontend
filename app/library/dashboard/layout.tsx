import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthUser, safeReturnTo } from "@/lib/server/auth";
import { ServerAuthProvider } from "@/components/ServerAuthProvider";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Dashboard",
  description: "Manage your profile and contributions.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuthUser();
  if (auth.status === "unavailable") {
    throw new Error("Authentication service is temporarily unavailable.");
  }
  if (auth.status !== "authenticated") {
    const requestHeaders = await headers();
    const returnTo = safeReturnTo(requestHeaders.get("x-app-pathname") || "/");
    redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  }
  return (
    <ServerAuthProvider
      user={auth.user}
      status="authenticated"
    >
      {children}
    </ServerAuthProvider>
  );
}
