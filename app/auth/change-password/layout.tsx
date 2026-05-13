import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Change your account password.",
};

export default function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
