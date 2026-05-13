import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your profile and contributions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
