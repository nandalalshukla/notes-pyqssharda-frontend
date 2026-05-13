"use client";

import React from "react";
import { FiHome, FiBell, FiBookmark, FiSettings } from "react-icons/fi";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/user/authStore";
import Link from "next/link";

export default function SocialSidebar() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const menuItems = [
    { label: "Home", icon: FiHome, href: "/", show: true },
    {
      label: "Notifications",
      icon: FiBell,
      href: "/notifications",
      show: isAuthenticated,
    },
    {
      label: "Bookmarks",
      icon: FiBookmark,
      href: "/bookmarks",
      show: isAuthenticated,
    },
    {
      label: "Settings",
      icon: FiSettings,
      href: "/settings",
      show: isAuthenticated,
    },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r-2 border-black bg-white">
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-black mb-8">Menu</h2>

        <nav className="space-y-2">
          {menuItems
            .filter((item) => item.show)
            .map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-black font-bold hover:bg-black hover:text-white transition-all"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Trending Section */}
        <div className="mt-8 pt-6 border-t-2 border-black">
          <h3 className="text-lg font-bold mb-4">Trending</h3>
          <div className="space-y-2">
            {[
              "#ShardaStudents",
              "#FeelFree",
              "#CSE",
              "#StudyTips",
              "#AcademicHelp",
            ].map((tag, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors font-semibold text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t-2 border-black">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-black rounded-xl p-4">
            <h3 className="font-bold text-sm mb-3">Community Stats</h3>
            <div className="space-y-2 text-xs font-semibold">
              <div>📝 1,234 posts today</div>
              <div>💬 5,678 comments</div>
              <div>❤️ 12,345 likes</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
