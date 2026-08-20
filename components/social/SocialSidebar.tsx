"use client";

import React from "react";
import { FiHome, FiBell, FiBookOpen, FiSettings } from "react-icons/fi";
import useAuthStore from "@/stores/user/authStore";
import Link from "next/link";

export default function SocialSidebar() {
  const { isAuthenticated } = useAuthStore();

  const menuItems = [
    { label: "Home", icon: FiHome, href: "/", show: true },
    {
      label: "Notifications",
      icon: FiBell,
      href: "/",
      show: isAuthenticated,
    },
    {
      label: "Library",
      icon: FiBookOpen,
      href: "/library",
      show: isAuthenticated,
    },
    {
      label: "Settings",
      icon: FiSettings,
      href: "/profile-settings",
      show: isAuthenticated,
    },
  ];

  return (
    <aside className="fixed top-16 left-0 hidden h-[calc(100vh-64px)] w-64 border-r border-border bg-card lg:block">
      <div className="space-y-4 p-6">
        <h2 className="mb-8 text-2xl font-black text-foreground">Menu</h2>

        <nav className="space-y-2">
          {menuItems
            .filter((item) => item.show)
            .map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Trending Section */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Trending</h3>
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
                className="w-full rounded-xl border border-border p-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent-purple/10 p-4">
            <h3 className="mb-3 text-sm font-bold text-foreground">Community Stats</h3>
            <div className="space-y-2 text-xs font-semibold text-muted-foreground">
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
