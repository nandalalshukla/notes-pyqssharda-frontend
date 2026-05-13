import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Sharda Social account.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
