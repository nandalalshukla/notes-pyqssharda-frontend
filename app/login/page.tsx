import { redirect } from "next/navigation";

export default async function LoginAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login");
}
