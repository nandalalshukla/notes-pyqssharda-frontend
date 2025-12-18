"use client";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthDesktopNav = () => {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/api/v1/auth/login");
  };

  return (
    <div className="flex items-center justify-between w-full py-4 px-8 bg-white text-black border-b-2 border-black">
      <Link
        href="/dashboard"
        className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform"
      >
        Sharda Online Library
      </Link>
      <div className="flex items-center gap-8 font-bold text-sm">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link href="/notes" className="hover:text-blue-600 transition-colors">
          Notes
        </Link>
        <Link href="/pyqs" className="hover:text-blue-600 transition-colors">
          PYQs
        </Link>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-[#FF6666] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthDesktopNav;
