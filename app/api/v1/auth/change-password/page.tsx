import ChangePasswordForm from "@/components/forms/changePswd";

const ChangePasswordPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Change Password
      </h2>
      <ChangePasswordForm />
    </div>
  );
};
export default ChangePasswordPage;
