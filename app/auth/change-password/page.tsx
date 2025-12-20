import AuthGuard from "@/components/AuthGuard";
import ChangePasswordForm from "@/components/forms/changePswd";

const ChangePasswordPage = () => {
  return (
    <AuthGuard>
      <ChangePasswordForm />
    </AuthGuard>
  );
};
export default ChangePasswordPage;
