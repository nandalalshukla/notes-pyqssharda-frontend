import LoginForm from "@/components/forms/loginForm";
import GuestOnlyGuard from "@/components/GuestOnlyGuard";
import { getServerAuthCookies, getServerAuthStatus, safeReturnTo } from "@/lib/server/auth";
import { redirect } from "next/navigation";

const LoginPage = async ({ searchParams }: { searchParams: Promise<{ next?: string }> }) => {
  const { next } = await searchParams;
  const nextPath = next ? safeReturnTo(next) : "/library/dashboard";
  const status = await getServerAuthStatus();
  if (status === "authenticated") redirect(nextPath);
  if (status === "unauthenticated") {
    const { refreshToken } = await getServerAuthCookies();
    if (refreshToken) {
      redirect(`/auth/refresh?returnTo=${encodeURIComponent(nextPath)}`);
    }
  }

  return (
    <GuestOnlyGuard>
      <LoginForm nextPath={nextPath} />
    </GuestOnlyGuard>
  );
};
export default LoginPage;
