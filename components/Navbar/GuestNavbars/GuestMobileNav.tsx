"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const GuestMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full px-4 py-3 text-gray-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-sm font-black text-white">
              S
            </span>
            <span className="text-xl font-black tracking-tight">SOL</span>
          </Link>
          <div className="flex items-center gap-1">
            <a
              href="https://www.linkedin.com/posts/nandalalshukla_shardauniversity-btech-engineering-activity-7417953428888293376-ToZ4?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAENPXPMBJ4aMSVhVHnrqUrH1E6gGnQdaGss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-lg p-2 text-gray-500"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/nandalalshukla/notes-pyqssharda-frontend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-gray-500"
            >
              <FaGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm"
          aria-label="Navigation menu"
        >
          {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 grid gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <Link
            href="/"
            className="rounded-xl bg-gray-950 px-3 py-2.5 text-sm font-semibold text-white"
            onClick={() => setIsOpen(false)}
          >
            Feed
          </Link>
          <Link
            href="/library/dashboard"
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Contribute
          </Link>
          <Link
            href="/about-us"
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/auth/login"
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-center text-sm font-bold text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl bg-gray-950 px-3 py-2.5 text-center text-sm font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestMobileNav;
