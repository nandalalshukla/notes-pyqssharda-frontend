import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const GuestDesktopNav = () => {
  return (
    <div className="flex items-center justify-between w-full py-4 px-8 text-black">
      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform"
        >
          SOL
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-black hover:scale-110 transition-all"
          >
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a
            href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-black hover:scale-110 transition-all"
          >
            <FaGithub className="w-6 h-6" />
          </a>
        </div>
      </div>
      <div className="flex items-center gap-8 font-bold text-sm">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 transition-colors"
        >
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
