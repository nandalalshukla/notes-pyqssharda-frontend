import ForgotPasswordForm from "@/components/forms/forgotPswd";

const ForgotPasswordPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Forgot Password
      </h2>
      <ForgotPasswordForm />
    </div>
  );
};
export default ForgotPasswordPage;
