import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const GuestDesktopNav = () => {
  return (
    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 text-gray-950 lg:px-8">
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white shadow-sm">
            S
          </span>
          <span className="text-xl font-black tracking-tight">SOL</span>
        </Link>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-5">
          <a
            href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
          >
            <FaGithub className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1">
        <Link
          href="/"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-950 shadow-sm"
        >
          Feed
        </Link>
        <Link
          href="/library/dashboard"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-white/70 hover:text-gray-950"
        >
          Contribute
        </Link>
        <Link
          href="/about-us"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-white/70 hover:text-gray-950"
        >
          About
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:text-gray-950"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="rounded-2xl bg-gray-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-950/20"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default GuestDesktopNav;
