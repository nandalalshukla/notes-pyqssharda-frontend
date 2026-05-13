import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for a new Sharda Social account.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
