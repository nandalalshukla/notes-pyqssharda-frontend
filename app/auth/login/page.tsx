import LoginForm from "@/components/forms/loginForm";
import GuestOnlyGuard from "@/components/GuestOnlyGuard";

const LoginPage = () => {
  return (
    <GuestOnlyGuard>
      <LoginForm />
    </GuestOnlyGuard>
  );
};
export default LoginPage;
