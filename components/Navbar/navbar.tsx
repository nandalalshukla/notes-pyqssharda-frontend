//to create a navbar component with links to home, about, contact, login, register, change password, dashboard and logout
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { logout } from "@/lib/api/auth.api";

const Navbar = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Logout failed");
    }
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Notes and Pyqs Sharda
        </Link>
        <Link href="/dashboard" className="text-white hover:text-gray-200">
          Dashboard
        </Link>
        <Link
          href="/api/v1/auth/register"
          className="text-white hover:text-gray-200"
        >
          Register
        </Link>
        <Link
          href="/api/v1/auth/login"
          className="text-white hover:text-gray-200"
        >
          Login
        </Link>
        <Link
          href="/api/v1/auth/change-password"
          className="text-white hover:text-gray-200"
        >
          Change Password
        </Link>
        <Link
          href="/api/v1/auth/forgot-password"
          className="text-white hover:text-gray-200"
        >
          Forgot Password
        </Link>
        <button
          onClick={handleLogout}
          className="text-white hover:text-gray-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
