import Link from "next/link";

const GuestDesktopNav = () => {
  return (
    <div className="flex items-center justify-between w-full py-4 px-8 text-black">
      <Link
        href="/"
        className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform"
      >
        Sharda Online Library
      </Link>
      <div className="flex items-center gap-8 font-bold text-sm">
        <Link href="/explore" className="hover:text-blue-600 transition-colors">
          Explore
        </Link>
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
          Contribute
        </Link>
        <Link
          href="/about-us"
          className="hover:text-blue-600 transition-colors"
        >
          About Us
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-2 border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-2 bg-[#FF9F66] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
