//create a simple dashboard page that says welcome to dashboard
export default function DashboardPage() {
    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-semibold mb-6 text-center">Welcome to the Dashboard</h1>
            <p className="text-center">This is your dashboard where you can manage your account and view your data.</p>
        </div>
    );
}
