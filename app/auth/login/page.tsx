import LoginForm from "@/components/forms/loginForm";
import GuestOnlyGuard from "@/components/GuestOnlyGuard";
import { getServerAuthStatus, safeReturnTo } from "@/lib/server/auth";
import { redirect } from "next/navigation";

const LoginPage = async ({ searchParams }: { searchParams: Promise<{ next?: string }> }) => {
  const { next } = await searchParams;
  const nextPath = next ? safeReturnTo(next) : "/";
  const status = await getServerAuthStatus();
  if (status === "authenticated") redirect(nextPath);

  return (
    <GuestOnlyGuard nextPath={nextPath}>
      <LoginForm nextPath={nextPath} />
    </GuestOnlyGuard>
  );
};
export default LoginPage;
