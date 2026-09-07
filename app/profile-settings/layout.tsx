import type { Metadata } from "next";

/** Private, per-user settings — never indexed. */
export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Sharda Social profile and account.",
  robots: { index: false, follow: false },
};

export default function ProfileSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
