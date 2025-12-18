//create a simple dashboard page that says welcome to dashboard
import AuthGuard from "@/components/AuthGuard";
export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Welcome to the Dashboard
        </h1>
        <p className="text-center">
          This is your dashboard where you can manage your account and view your
          data.
        </p>
      </div>
    </AuthGuard>
  );
}
