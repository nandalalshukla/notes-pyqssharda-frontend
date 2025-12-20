"use client";
import Link from "next/link";
import { useState } from "react";

const GuestMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full text-black p-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-black tracking-tighter">
          Sharda Online Library
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {/* Hamburger / Close Icon */}
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-4 mt-4 pb-4 font-bold">
          <Link
            href="/explore"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Explore
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Contribute
          </Link>
          <Link
            href="/about-us"
            className="hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          <div className="flex flex-col gap-3 mt-2">
            <Link
              href="/auth/login"
              className="text-center px-6 py-2 border-2 border-black rounded-full hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="text-center px-6 py-2 bg-[#FF9F66] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
