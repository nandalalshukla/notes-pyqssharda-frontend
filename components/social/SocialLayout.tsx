"use client";

import React from "react";
import { SocialSidebar } from "@/components/social";

interface SocialLayoutProps {
  children: React.ReactNode;
}

export default function SocialLayout({ children }: SocialLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar - Hidden on mobile, visible on large screens */}
      <SocialSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {children}
      </main>

      {/* Right Sidebar for Trending/Suggestions on larger screens */}
      <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-64px)] w-72 border-l-2 border-black bg-white">
        <div className="p-6">
          <h2 className="text-2xl font-black mb-6">Discover</h2>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts, users..."
              className="w-full p-3 border-2 border-black rounded-full font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Suggested Users */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Suggested Users</h3>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-50 border-2 border-black rounded-xl p-3 space-y-2"
              >
                <div className="h-3 bg-gray-300 rounded w-24" />
                <button className="w-full py-2 px-3 text-sm font-bold bg-black text-white border-2 border-transparent rounded-lg hover:bg-white hover:text-black hover:border-black transition-all">
                  Follow
                </button>
              </div>
            ))}
          </div>

          {/* What's Happening */}
          <div className="mt-8 pt-6 border-t-2 border-black">
            <h3 className="font-bold text-lg mb-4">What's Happening</h3>
            <div className="space-y-2">
              {[
                "New feature: Polls coming soon",
                "Community milestone: 10K users",
                "Tip: Use hashtags to reach more users",
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="w-full text-left p-3 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors text-sm font-semibold"
                >
                  ℹ️ {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
