import RegisterForm from "@/components/forms/registerForm";
import GuestOnlyGuard from "@/components/GuestOnlyGuard";

const RegisterPage = () => {
  return (
    <GuestOnlyGuard>
      <RegisterForm />
    </GuestOnlyGuard>
  );
};
export default RegisterPage;
